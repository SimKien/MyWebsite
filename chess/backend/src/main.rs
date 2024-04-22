mod util;
mod storage;

use util::{calculate_valid_moves, get_player_color, validate_user};
use storage::{import_games, import_open_game, import_players, import_users, write_state_loop};

use std::collections::HashMap;

use axum::{
    extract::{
        ws::{WebSocket, WebSocketUpgrade},
        Query, State,
    },
    response::Response,
    routing::{get, get_service},
    Json, Router,
};
use comlib::{
    BoardPositionInformation, PlayerGameInformation, UserInformation, UserValid, SpecialMove,
    ValidMovesInformation, WebsocketMessage,
};
use futures_util::{SinkExt, StreamExt};
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc::{Receiver, Sender};
use tower_http::services::{ServeDir, ServeFile};
use tracing::{error, warn};
use uuid::Uuid;


//tyoes
type SharedState = std::sync::Arc<tokio::sync::Mutex<AppState>>;

#[derive(Debug)]
struct ClientConnection {
    id: Uuid,
    recv: Receiver<WebsocketMessage>,
}

#[derive(Debug, Clone)]
struct Client {
    send: Sender<WebsocketMessage>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct UserQuery {
    user_id: String,
    token: String,
}

#[derive(Debug, Clone)]
pub struct User {
    id: Uuid,
    token: String,
}

#[derive(Debug, Clone)]
pub struct Player {
    user: User,
    current_game_id: Uuid,
    in_game: bool,
}

#[derive(Debug, Clone)]
pub struct Game {
    white_player: Uuid,
    black_player: Uuid,
    player_to_play: Uuid,
    board_position: String,
    finished: bool,
}

#[derive(Debug, Clone)]
struct AppState {
    clients: HashMap<Uuid, Client>,
    games: HashMap<Uuid, Game>,
    open_game: Option<Uuid>,
    users: HashMap<Uuid, User>,
    players: HashMap<Uuid, Player>,
}

impl AppState {
    fn new() -> Self {
        Self {
            clients: HashMap::new(),
            games: HashMap::new(),
            open_game: None,
            users: HashMap::new(),
            players: HashMap::new(),
        }
    }
}


//constants
const MESSAGE_TYPES: [&str; 2] = ["move", "ping"];

const FRONTEND_BASE_DIR: &str = "../frontend/dist";

const COLOR_WHITE: &str = "white";
const COLOR_BLACK: &str = "black";

const DEFAULT_BOARD_POSITION: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

const INVALID_ID: Uuid = Uuid::nil();



async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(user_information): Query<UserQuery>,
    State(state): State<SharedState>,
) -> Response {
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

    ws.on_upgrade(|socket| {
        handle_socket(socket, client_connection, cloned_state, user_information)
    })
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

        if !validate_user(
            &user_information,
            locked_state.users.get(&user_uuid).unwrap(),
        ) {
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
            println!("Received from client: {:?}", msg);

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

        println!("Send to client: {}", msg);
        if sender.send(msg.into()).await.is_err() {
            error!("Failed to send message");
            return;
        }
    }
}

//man könnte überlegen, clients zu löschen wenn die websocket communication abbricht, für Skalierbarkeit

async fn get_board_position(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<BoardPositionInformation> {
    let user_id = user_information.user_id.clone();
    let user_uuid = Uuid::parse_str(&user_id).unwrap();

    let locked_state = state.lock().await;

    if !validate_user(
        &user_information,
        locked_state.users.get(&user_uuid).unwrap(),
    ) {
        return Json(BoardPositionInformation {
            board_position: String::from(""),
        });
    }

    let current_game_id = locked_state
        .players
        .get(&user_uuid)
        .unwrap()
        .current_game_id;

    let board_position = BoardPositionInformation {
        board_position: locked_state
            .games
            .get(&current_game_id)
            .unwrap()
            .board_position
            .clone(),
    };
    Json(board_position)
}

async fn get_default_board() -> Json<BoardPositionInformation> {
    Json(BoardPositionInformation {
        board_position: String::from(DEFAULT_BOARD_POSITION),
    })
}

async fn get_valid_moves(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<ValidMovesInformation> {
    let user_id = user_information.user_id.clone();
    let user_uuid = Uuid::parse_str(&user_id).unwrap();

    let locked_state = state.lock().await;

    if !validate_user(
        &user_information,
        locked_state.users.get(&user_uuid).unwrap(),
    ) {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let current_player = locked_state.players.get(&user_uuid).unwrap();
    let current_game = locked_state
        .games
        .get(&current_player.current_game_id)
        .unwrap();

    if current_game.player_to_play != current_player.user.id {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let valid_moves = calculate_valid_moves();

    Json(valid_moves)
}

async fn get_user_game(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<PlayerGameInformation> {
    let user_id = user_information.user_id.clone();
    let user_uuid = Uuid::parse_str(&user_id).unwrap();

    let mut locked_state = state.lock().await;

    if !validate_user(
        &user_information,
        locked_state.users.get(&user_uuid).unwrap(),
    ) {
        return Json(PlayerGameInformation {
            id: user_information.user_id,
            token: user_information.token,
            color: String::from(""),
        });
    }

    let mut current_player = locked_state.players.get(&user_uuid).unwrap().clone();

    if current_player.in_game {
        let current_game = locked_state
            .games
            .get(&current_player.current_game_id)
            .unwrap();
        let color = get_player_color(&current_player, &current_game);
        return Json(PlayerGameInformation {
            id: user_information.user_id,
            token: user_information.token,
            color: color,
        });
    }

    let game = locked_state.open_game.clone();
    let result = match game {
        Some(game_id) => {
            let mut game = locked_state.games.get(&game_id).unwrap().clone();
            game.black_player = user_uuid;
            locked_state.games.insert(game_id, game);
            locked_state.open_game = None;
            current_player.in_game = true;
            current_player.current_game_id = game_id.clone();
            locked_state.players.insert(user_uuid, current_player);
            PlayerGameInformation {
                id: user_information.user_id,
                token: user_information.token,
                color: String::from(COLOR_BLACK),
            }
        }
        None => {
            let new_game_uuid = Uuid::new_v4();
            let game = Game {
                white_player: user_uuid,
                black_player: INVALID_ID.clone(),
                player_to_play: user_uuid,
                board_position: String::from(DEFAULT_BOARD_POSITION),
                finished: false,
            };
            locked_state.games.insert(new_game_uuid.clone(), game);
            locked_state.open_game = Some(new_game_uuid);
            current_player.in_game = true;
            current_player.current_game_id = new_game_uuid.clone();
            locked_state.players.insert(user_uuid, current_player);
            PlayerGameInformation {
                id: user_information.user_id,
                token: user_information.token,
                color: String::from(COLOR_WHITE),
            }
        }
    };
    Json(result)
}

async fn get_new_user(State(state): State<SharedState>) -> Json<UserInformation> {
    const TOKEN_LENGTH: usize = 32;

    let user_id = Uuid::new_v4();
    let random_token: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(TOKEN_LENGTH)
        .map(char::from)
        .collect();

    let user = UserInformation {
        id: user_id.to_string(),
        token: random_token.clone(),
    };

    let mut state = state.lock().await;

    let new_user = User {
        id: user_id.clone(),
        token: random_token.clone(),
    };

    state.users.insert(user_id, new_user);

    Json(user)
}

async fn is_user_valid(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<UserValid> {
    let user_id = user_information.user_id.clone();
    let user_uuid_parse = Uuid::parse_str(&user_id);

    if user_uuid_parse.is_err() {
        return Json(UserValid { valid: false });
    }

    let user_uuid = user_uuid_parse.unwrap();

    let locked_state = state.lock().await;

    let user_get = locked_state.users.get(&user_uuid);

    if user_get.is_none() {
        return Json(UserValid { valid: false });
    }

    let user = user_get.unwrap();

    let user_valid = UserValid {
        valid: validate_user(&user_information, user),
    };

    Json(user_valid)
}

#[tokio::main]
async fn main() {
    let state = AppState::new();
    let state = std::sync::Arc::new(tokio::sync::Mutex::new(state));

    {
        let mut locked_state = state.lock().await;
        locked_state.users = import_users();
        locked_state.players = import_players(&locked_state.users);
        locked_state.games = import_games();
        locked_state.open_game = import_open_game();
    }

    println!("Users at start: {:?}", state.lock().await.users);
    println!("Players at start: {:?}", state.lock().await.players);
    println!("Games at start: {:?}", state.lock().await.games);

    tokio::spawn(write_state_loop(state.clone()));

    let port = std::env::var("CHESS_PORT").unwrap_or_else(|_| "5173".to_string());

    let api = Router::new()
        .route("/ping", get(|| async { "pong" }))
        .route("/game", get(get_user_game))
        .route("/valid-moves", get(get_valid_moves))
        .route("/board-position", get(get_board_position))
        .route("/default-board", get(get_default_board))
        .route("/user", get(get_new_user))
        .route("/is-valid", get(is_user_valid))
        .with_state(state.clone());

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .nest("/api", api)
        .nest_service(
            "/",
            get_service(
                ServeDir::new(&FRONTEND_BASE_DIR).fallback(ServeFile::new(&format!(
                    "{}/index.html",
                    &FRONTEND_BASE_DIR
                ))),
            ),
        )
        .with_state(state.clone());

    axum::Server::bind(&format!("0.0.0.0:{}", port).parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}