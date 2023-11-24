use std::collections::HashMap;

use axum::{
    extract::{
        ws::{WebSocket, WebSocketUpgrade},
        Query,
    },
    response::{IntoResponse, Response},
    routing::{get, get_service},
    Json, Router,
};
use comlib::{
    BoardPositionInformation, PlayerGameInformation, PlayerInformation, SpecialMove,
    ValidMovesInformation, WebsocketMessage,
};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tower_http::services::{ServeDir, ServeFile};
use tracing::{error, warn};
use util::UniqueIdGenerator;
use uuid::Uuid;

mod util;

#[derive(Deserialize, Serialize, Debug)]
struct PlayerQuery {
    player_id: String,
    token: String,
}

struct Client {
    id: Uuid,
    token: String,
    game_id: Uuid,
}

struct AppState {
    id_generator: UniqueIdGenerator,
    connections: HashMap<u64, Client>,
}

const FRONTEND_BASE_DIR: &str = "../frontend/dist";

async fn handler(ws: WebSocketUpgrade, Query(player_information): Query<PlayerQuery>) -> Response {
    println!("New connection {}", player_information.player_id);
    ws.on_upgrade(|socket| handle_socket(socket))
}

async fn handle_socket(socket: WebSocket) {
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
            println!("{:?}", msg);
            let move_info = WebsocketMessage {
                message_type: String::from("move"),
                from: String::from("e7"),
                to: String::from("e5"),
                move_type: String::from("normal"),
                promotion_piece: String::from("Q"),
            };
            let msg = serde_json::to_string(&move_info).unwrap();
            if sender.send(msg.into()).await.is_err() {
                error!("Failed to send message");
                return;
            }
        }
    });
}

async fn get_board_position(
    Query(player_information): Query<PlayerQuery>,
) -> Json<BoardPositionInformation> {
    //TODO: Checks for the right game and return this board as string

    let board_position = BoardPositionInformation {
        board_position: String::from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"),
    };
    Json(board_position)
}

async fn get_valid_moves(
    Query(player_information): Query<PlayerQuery>,
) -> Json<ValidMovesInformation> {
    //TODO

    let mut valid_moves_map: HashMap<String, Vec<String>> = HashMap::new();
    valid_moves_map.insert(
        String::from("e2"),
        Vec::from([String::from("e4"), String::from("e3")]),
    );
    valid_moves_map.insert(
        String::from("d2"),
        Vec::from([String::from("d4"), String::from("d3")]),
    );
    valid_moves_map.insert(
        String::from("f1"),
        Vec::from([String::from("d3"), String::from("c4")]),
    );
    valid_moves_map.insert(
        String::from("g1"),
        Vec::from([String::from("e2"), String::from("f3")]),
    );
    valid_moves_map.insert(
        String::from("e1"),
        Vec::from([String::from("g1"), String::from("f1")]),
    );
    let mut special_moves = Vec::<SpecialMove>::new();
    special_moves.push(SpecialMove {
        from_absolute: String::from("e1"),
        to_absolute: String::from("g1"),
        special_type: String::from("castling"),
    });

    let valid_moves = ValidMovesInformation {
        valid_moves: valid_moves_map,
        special_moves: Vec::new(),
    };

    Json(valid_moves)
}

async fn get_player_game(
    Query(player_information): Query<PlayerQuery>,
) -> Json<PlayerGameInformation> {
    //TODO: Checks for the right game and return the right color of the player

    let player_game_information = PlayerGameInformation {
        id: player_information.player_id,
        token: player_information.token,
        color: String::from("white"),
    };
    Json(player_game_information)
}

async fn get_player() -> impl IntoResponse {
    //TODO

    let player = PlayerInformation {
        id: String::from("12345678"),
        token: String::from("12345678"),
    };
    let data = serde_json::to_string(&player).unwrap();
    Response::new(data)
}

#[tokio::main]
async fn main() {
    let port = std::env::var("CHESS_PORT").unwrap_or_else(|_| "8080".to_string());

    let api = Router::new()
        .route("/ping", get(|| async { "pong" }))
        .route("/game", get(get_player_game))
        .route("/valid-moves", get(get_valid_moves))
        .route("/board-position", get(get_board_position))
        .route("/player", get(get_player));

    let app = Router::new()
        .route("/ws", get(handler))
        .nest("/api", api)
        .nest_service(
            "/",
            get_service(
                ServeDir::new(&FRONTEND_BASE_DIR).fallback(ServeFile::new(&format!(
                    "{}/index.html",
                    &FRONTEND_BASE_DIR
                ))),
            ),
        );

    axum::Server::bind(&format!("0.0.0.0:{}", port).parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
