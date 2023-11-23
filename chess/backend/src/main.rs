use axum::{
    extract::{
        ws::{WebSocket, WebSocketUpgrade},
        Query,
    },
    response::{IntoResponse, Response},
    routing::{get, get_service},
    Json, Router,
};
//use futures_util::stream::StreamExt;
use futures_util::{SinkExt, StreamExt};
use message_types::{
    BoardPositionInformation, MoveInformation, PlayerGameInformation, PlayerInformation,
    PlayerQuery, SpecialMove, ValidMovesInformation,
};
use serde_json::{Map, Value};
use tower_http::services::{ServeDir, ServeFile};
use tracing::{error, warn};

mod message_types;

const FRONTEND_BASE_DIR: &str = "../frontend/dist";

async fn handler(ws: WebSocketUpgrade) -> Response {
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
                if let Ok(msg) = serde_json::from_str::<MoveInformation>(&msg) {
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
            let moveInfo = MoveInformation {
                messageType: String::from("move"),
                from: String::from("e7"),
                to: String::from("e5"),
                moveType: String::from("normal"),
                promotionPiece: String::from("Q"),
            };
            let msg = serde_json::to_string(&moveInfo).unwrap();
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
        boardPosition: String::from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"),
    };
    Json(board_position)
}

async fn get_valid_moves(
    Query(player_information): Query<PlayerQuery>,
) -> Json<ValidMovesInformation> {
    //TODO

    let mut valid_moves_map: Map<String, Value> = Map::new();
    valid_moves_map.insert(
        String::from("e2"),
        Value::Array(vec![
            Value::String(String::from("e3")),
            Value::String(String::from("e4")),
        ]),
    );
    valid_moves_map.insert(
        String::from("d2"),
        Value::Array(vec![
            Value::String(String::from("d4")),
            Value::String(String::from("d3")),
        ]),
    );

    let valid_moves = ValidMovesInformation {
        validMoves: valid_moves_map,
        specialMoves: Vec::new(),
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
