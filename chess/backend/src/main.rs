mod routes;
mod state;
mod storage;
mod utils;

use std::sync::Arc;

use storage::{import_games, import_pending_game, import_players, import_users, write_state_loop};

use axum::{
    routing::{get, get_service},
    Router,
};
use comlib::WebsocketMessage;
use serde::{Deserialize, Serialize};
use tokio::sync::{
    mpsc::{Receiver, Sender},
    Mutex, MutexGuard,
};
use tower_http::services::{ServeDir, ServeFile};
use uuid::Uuid;

use crate::state::AppState;

//tyoes
#[derive(Debug)]
pub struct ClientConnection {
    id: Uuid,
    recv: Receiver<WebsocketMessage>,
}

#[derive(Debug, Clone)]
pub struct Client {
    send: Sender<WebsocketMessage>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct UserQuery {
    user_id: String,
    token: String,
}

#[derive(Debug, Clone)]
pub struct User {
    user_id: Uuid,
    token: String,
}

impl User {
    pub fn new(user_id: Uuid, token: String) -> Self {
        Self {
            user_id: user_id,
            token: token,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Player {
    user: User,
    current_game_id: Uuid,
    in_game: bool,
}

impl Player {
    pub fn new(user: User, current_game_id: Uuid, in_game: bool) -> Self {
        Self {
            user: user,
            current_game_id: current_game_id,
            in_game: in_game,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Game {
    white_player: Uuid,
    black_player: Uuid,
    player_to_play: Uuid,
    fen: String,
    finished: bool,
}

impl Game {
    pub fn new(white: Uuid, black: Uuid) -> Self {
        Self {
            white_player: white,
            black_player: black,
            player_to_play: white,
            fen: String::from(DEFAULT_FEN),
            finished: false,
        }
    }
}

#[derive(Debug, Clone)]
pub struct PendingGame {
    game: Option<Uuid>,
}

impl PendingGame {
    pub fn new() -> Self {
        Self { game: None }
    }

    pub fn new_with_game(game: Uuid) -> Self {
        Self { game: Some(game) }
    }

    pub fn update(&mut self, player_id: &Uuid, state: &MutexGuard<AppState>) -> (Uuid, Game) {
        match self.game {
            Some(id) => {
                let mut game = state.games.get(&id).unwrap().clone();
                game.black_player = player_id.clone();
                self.game = None;
                (id.clone(), game)
            }
            None => {
                let game = Game::new(player_id.clone(), Uuid::nil());
                let new_game_uuid = Uuid::new_v4();
                self.game = Some(new_game_uuid);
                (new_game_uuid.clone(), game)
            }
        }
    }
}

//constants
pub const MESSAGE_TYPES: [&str; 2] = ["move", "ping"];

const FRONTEND_BASE_DIR: &str = "../frontend/dist";

pub const COLOR_WHITE: &str = "white";
pub const COLOR_BLACK: &str = "black";

pub const DEFAULT_BOARD_POSITION: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
pub const DEFAULT_FEN: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

pub const INVALID_ID: Uuid = Uuid::nil();
pub const TOKEN_LENGTH: usize = 32;

//TODO: man könnte überlegen, clients zu löschen wenn die websocket communication abbricht, für Skalierbarkeit

/*
Starts an axum server and serve the frontend and the api
Starts a tokio task that writes the state to the disk every second
*/
#[tokio::main]
async fn main() {
    let state = AppState::new();
    let state = Arc::new(Mutex::new(state));

    {
        let mut locked_state = state.lock().await;
        locked_state.users = import_users();
        locked_state.players = import_players(&locked_state.users);
        locked_state.games = import_games();
        locked_state.pending_game = import_pending_game();
    }

    println!("Users at start: {:?}", state.lock().await.users);
    println!("Players at start: {:?}", state.lock().await.players);
    println!("Games at start: {:?}", state.lock().await.games);

    tokio::spawn(write_state_loop(state.clone()));

    let port = std::env::var("CHESS_PORT").unwrap_or_else(|_| "5173".to_string());

    let api = Router::new()
        .route("/ping", get(|| async { "pong" }))
        .route("/game", get(routes::get_user_game))
        .route("/valid-moves", get(routes::get_valid_moves))
        .route("/board-position", get(routes::get_board_position))
        .route("/default-board", get(routes::get_default_board))
        .route("/user", get(routes::get_new_user))
        .route("/is-valid", get(routes::is_user_valid))
        .with_state(state.clone());

    let app = Router::new()
        .route("/ws", get(routes::ws_handler))
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
