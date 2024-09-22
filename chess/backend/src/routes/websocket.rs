use axum::{
    extract::{ws::WebSocket, Query, State, WebSocketUpgrade},
    response::IntoResponse,
};
use comlib::WebsocketMessage;
use futures_util::{SinkExt, StreamExt};
use tracing::{error, warn};
use uuid::Uuid;

use crate::{
    state::{AppState, SharedState},
    utils::{get_player_color, validate_user},
    Client, ClientConnection, UserQuery, INVALID_ID, MESSAGE_TYPES,
};

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(user_information): Query<UserQuery>,
    State(state): State<SharedState>,
) -> impl IntoResponse {
    let user_id = user_information.user_id.clone();
    let user_uuid = Uuid::parse_str(&user_id).unwrap();

    let (sender, receiver) = tokio::sync::mpsc::channel(100);

    let client = Client {
        send: sender.clone(),
    };

    let mut locked_state = state.lock().await;

    locked_state.clients.insert(user_uuid, client);

    let client_connection = ClientConnection {
        id: user_uuid.clone(),
        recv: receiver,
    };

    let cloned_state = state.clone();

    ws.on_upgrade(|socket| handle_socket(socket, client_connection, cloned_state, user_information))
}

async fn handle_socket(
    socket: WebSocket,
    mut client_connection: ClientConnection,
    state: std::sync::Arc<tokio::sync::Mutex<AppState>>,
    user_information: UserQuery,
) {
    {
        let user_id = user_information.user_id.clone();
        let user_uuid = Uuid::parse_str(&user_id).unwrap();

        let mut locked_state = state.lock().await;

        if !validate_user(&user_information, locked_state.users.get(&user_uuid)) {
            locked_state.clients.remove(&user_uuid);
            return;
        }
    }

    let (mut sender, mut receiver) = socket.split();

    tokio::spawn(async move {
        while let Some(msg) = receiver.next().await {
            let msg = if let Some(msg) = msg.ok().and_then(|msg| {
                if matches!(msg, axum::extract::ws::Message::Close(_)) {
                    None
                } else {
                    msg.into_text().ok()
                }
            }) {
                if let Ok(msg) = serde_json::from_str::<WebsocketMessage>(&msg) {
                    msg
                } else {
                    warn!("Received invalid message: {}", msg);
                    continue;
                }
            } else {
                error!("Invalid message");
                return;
            };
            //println!("Received from client: {:?}", msg);

            if msg.message_type == MESSAGE_TYPES[1] {
                continue;
            }

            let mut locked_state = state.lock().await;
            let current_player = locked_state
                .players
                .get(&client_connection.id)
                .unwrap()
                .clone();

            if !current_player.in_game {
                continue;
            }

            let mut current_game = locked_state
                .games
                .get_mut(&current_player.current_game_id)
                .unwrap()
                .clone();

            let player_color = get_player_color(&current_player, &current_game);

            let opponent_id = if player_color == "white" {
                current_game.black_player
            } else {
                current_game.white_player
            };

            if opponent_id == INVALID_ID {
                continue;
            }
            let opponent_client = locked_state.clients.get(&opponent_id).unwrap().clone();

            //TODO: check if the move made is really valid and if the player is the player to play

            //TODO: Update board position and valid moves, aber zuerst boardposition setzen dass validmoves richtig funktioniert

            current_game.player_to_play = opponent_id.clone();

            locked_state.games.remove(&current_player.current_game_id);
            locked_state
                .games
                .insert(current_player.current_game_id, current_game);

            if opponent_client.send.send(msg).await.is_err() {
                continue;
            }
        }
    });

    while let Some(msg) = client_connection.recv.recv().await {
        let msg = serde_json::to_string(&msg).unwrap();

        //println!("Send to client: {}", msg);
        if sender.send(msg.into()).await.is_err() {
            error!("Failed to send message");
            return;
        }
    }
}
