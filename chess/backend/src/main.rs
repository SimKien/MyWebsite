use std::{collections::HashMap, fs, time::Duration};

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
    BoardPositionInformation, PlayerGameInformation, PlayerInformation, PlayerValid, SpecialMove,
    ValidMovesInformation, WebsocketMessage,
};
use futures_util::{SinkExt, StreamExt};
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc::{Receiver, Sender};
use tower_http::services::{ServeDir, ServeFile};
use tracing::{error, warn};
use util::{calculate_valid_moves, get_player_color, validate_player};
use uuid::Uuid;

mod util;

const FRONTEND_BASE_DIR: &str = "../frontend/dist";

const DEFAULT_BOARD_POSITION: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

const PLAYERS_FILE: &str = "players.json";

const GAMES_FILE: &str = "games.json";

const OPEN_GAME_FILE: &str = "open_game.json";

const INVALID_ID: Uuid = Uuid::nil();

type SharedState = std::sync::Arc<tokio::sync::Mutex<AppState>>;

const MESSAGE_TYPES: [&str; 2] = ["move", "ping"];

#[derive(Deserialize, Serialize, Debug)]
pub struct PlayerQuery {
    player_id: String,
    token: String,
}

#[derive(Debug)]
struct ClientConnection {
    id: Uuid,
    recv: Receiver<WebsocketMessage>,
}

#[derive(Debug, Clone)]
struct Client {
    send: Sender<WebsocketMessage>,
}

#[derive(Debug, Clone)]
pub struct Player {
    id: Uuid,
    token: String,
    current_game_id: Uuid,
    in_game: bool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct PlayerFileStore {
    id: String,
    token: String,
    current_game_id: String,
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

#[derive(Debug, Clone, Deserialize, Serialize)]
struct GameFileStore {
    white_player: String,
    black_player: String,
    player_to_play: String,
    board_position: String,
    finished: bool,
}

type OpenGameFileStore = String;

#[derive(Debug, Clone)]
struct AppState {
    clients: HashMap<Uuid, Client>,
    games: HashMap<Uuid, Game>,
    open_game: Option<Uuid>,
    players: HashMap<Uuid, Player>,
}

impl AppState {
    fn new() -> Self {
        Self {
            clients: HashMap::new(),
            games: HashMap::new(),
            open_game: None,
            players: HashMap::new(),
        }
    }
}

async fn handler(
    ws: WebSocketUpgrade,
    Query(player_information): Query<PlayerQuery>,
    State(state): State<SharedState>,
) -> Response {
    let player_id = player_information.player_id.clone();
    let player_uuid = Uuid::parse_str(&player_id).unwrap();

    let (sender, receiver) = tokio::sync::mpsc::channel(100);

    let client = Client {
        send: sender.clone(),
    };

    let mut locked_state = state.lock().await;

    locked_state.clients.insert(player_uuid, client);

    let client_connection = ClientConnection {
        id: player_uuid.clone(),
        recv: receiver,
    };

    let cloned_state = state.clone();

    ws.on_upgrade(|socket| {
        handle_socket(socket, client_connection, cloned_state, player_information)
    })
}

async fn handle_socket(
    socket: WebSocket,
    mut client_connection: ClientConnection,
    state: std::sync::Arc<tokio::sync::Mutex<AppState>>,
    player_information: PlayerQuery,
) {
    {
        let player_id = player_information.player_id.clone();
        let player_uuid = Uuid::parse_str(&player_id).unwrap();

        let mut locked_state = state.lock().await;

        if !validate_player(
            &player_information,
            locked_state.players.get(&player_uuid).unwrap(),
        ) {
            locked_state.clients.remove(&player_uuid);
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
    Query(player_information): Query<PlayerQuery>,
) -> Json<BoardPositionInformation> {
    let player_id = player_information.player_id.clone();
    let player_uuid = Uuid::parse_str(&player_id).unwrap();

    let locked_state = state.lock().await;

    if !validate_player(
        &player_information,
        locked_state.players.get(&player_uuid).unwrap(),
    ) {
        return Json(BoardPositionInformation {
            board_position: String::from(""),
        });
    }

    let current_game_id = locked_state
        .players
        .get(&player_uuid)
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

async fn get_valid_moves(
    State(state): State<SharedState>,
    Query(player_information): Query<PlayerQuery>,
) -> Json<ValidMovesInformation> {
    let player_id = player_information.player_id.clone();
    let player_uuid = Uuid::parse_str(&player_id).unwrap();

    let locked_state = state.lock().await;

    if !validate_player(
        &player_information,
        locked_state.players.get(&player_uuid).unwrap(),
    ) {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let current_player = locked_state.players.get(&player_uuid).unwrap();
    let current_game = locked_state
        .games
        .get(&current_player.current_game_id)
        .unwrap();

    if current_game.player_to_play != current_player.id {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let valid_moves = calculate_valid_moves();

    Json(valid_moves)
}

async fn get_player_game(
    State(state): State<SharedState>,
    Query(player_information): Query<PlayerQuery>,
) -> Json<PlayerGameInformation> {
    let player_id = player_information.player_id.clone();
    let player_uuid = Uuid::parse_str(&player_id).unwrap();

    let mut locked_state = state.lock().await;

    if !validate_player(
        &player_information,
        locked_state.players.get(&player_uuid).unwrap(),
    ) {
        return Json(PlayerGameInformation {
            id: player_information.player_id,
            token: player_information.token,
            color: String::from(""),
        });
    }

    let mut current_player = locked_state.players.get(&player_uuid).unwrap().clone();

    if current_player.in_game {
        let current_game = locked_state
            .games
            .get(&current_player.current_game_id)
            .unwrap();
        let color = get_player_color(&current_player, &current_game);
        return Json(PlayerGameInformation {
            id: player_information.player_id,
            token: player_information.token,
            color: color,
        });
    }

    let game = locked_state.open_game.clone();
    let result = match game {
        Some(game_id) => {
            let mut game = locked_state.games.get(&game_id).unwrap().clone();
            game.black_player = player_uuid;
            locked_state.games.insert(game_id, game);
            locked_state.open_game = None;
            current_player.in_game = true;
            current_player.current_game_id = game_id.clone();
            locked_state.players.insert(player_uuid, current_player);
            PlayerGameInformation {
                id: player_information.player_id,
                token: player_information.token,
                color: String::from("black"),
            }
        }
        None => {
            let new_game_uuid = Uuid::new_v4();
            let game = Game {
                white_player: player_uuid,
                black_player: INVALID_ID.clone(),
                player_to_play: player_uuid,
                board_position: String::from(DEFAULT_BOARD_POSITION),
                finished: false,
            };
            locked_state.games.insert(new_game_uuid.clone(), game);
            locked_state.open_game = Some(new_game_uuid);
            current_player.in_game = true;
            current_player.current_game_id = new_game_uuid.clone();
            locked_state.players.insert(player_uuid, current_player);
            PlayerGameInformation {
                id: player_information.player_id,
                token: player_information.token,
                color: String::from("white"),
            }
        }
    };
    Json(result)
}

async fn get_player(State(state): State<SharedState>) -> Json<PlayerInformation> {
    const TOKEN_LENGTH: usize = 32;

    let player_id = Uuid::new_v4();
    let random_token: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(TOKEN_LENGTH)
        .map(char::from)
        .collect();

    let player = PlayerInformation {
        id: player_id.to_string(),
        token: random_token.clone(),
    };

    let mut state = state.lock().await;

    let new_player = Player {
        id: player_id.clone(),
        token: random_token.clone(),
        current_game_id: INVALID_ID.clone(),
        in_game: false,
    };

    state.players.insert(player_id, new_player);

    Json(player)
}

async fn is_player_valid(
    State(state): State<SharedState>,
    Query(player_information): Query<PlayerQuery>,
) -> Json<PlayerValid> {
    let player_id = player_information.player_id.clone();
    let player_uuid_parse = Uuid::parse_str(&player_id);

    if player_uuid_parse.is_err() {
        return Json(PlayerValid { valid: false });
    }

    let player_uuid = player_uuid_parse.unwrap();

    let locked_state = state.lock().await;

    let player_get = locked_state.players.get(&player_uuid);

    if player_get.is_none() {
        return Json(PlayerValid { valid: false });
    }

    let player = player_get.unwrap();

    let player_valid = PlayerValid {
        valid: validate_player(&player_information, player),
    };

    Json(player_valid)
}

#[tokio::main]
async fn main() {
    let state = AppState::new();
    let state = std::sync::Arc::new(tokio::sync::Mutex::new(state));

    {
        let mut locked_state = state.lock().await;
        locked_state.players = import_players();
        locked_state.games = import_games();
        locked_state.open_game = import_open_game();
    }

    println!("Players at start: {:?}", state.lock().await.players);
    println!("Games at start: {:?}", state.lock().await.games);

    tokio::spawn(write_state_loop(state.clone()));

    let port = std::env::var("CHESS_PORT").unwrap_or_else(|_| "8080".to_string());

    let api = Router::new()
        .route("/ping", get(|| async { "pong" }))
        .route("/game", get(get_player_game))
        .route("/valid-moves", get(get_valid_moves))
        .route("/board-position", get(get_board_position))
        .route("/player", get(get_player))
        .route("/is-valid", get(is_player_valid))
        .with_state(state.clone());

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
        )
        .with_state(state.clone());

    axum::Server::bind(&format!("0.0.0.0:{}", port).parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn write_state_loop(state: std::sync::Arc<tokio::sync::Mutex<AppState>>) {
    let mut interval = tokio::time::interval(Duration::from_millis(1000));
    loop {
        interval.tick().await;

        let locked_state = state.lock().await;

        let players = locked_state.players.clone();
        let games = locked_state.games.clone();
        let open_game = locked_state.open_game.clone();

        let mut players_file_store: HashMap<String, PlayerFileStore> = HashMap::new();
        let mut games_file_store: HashMap<String, GameFileStore> = HashMap::new();
        let mut open_game_file_store: OpenGameFileStore = String::new();

        for player in players {
            let player_file_store = PlayerFileStore {
                id: player.1.id.to_string(),
                token: player.1.token,
                current_game_id: player.1.current_game_id.to_string(),
                in_game: player.1.in_game,
            };
            players_file_store.insert(player.0.to_string(), player_file_store);
        }

        for game in games {
            let game_file_store = GameFileStore {
                white_player: game.1.white_player.to_string(),
                black_player: game.1.black_player.to_string(),
                player_to_play: game.1.player_to_play.to_string(),
                board_position: game.1.board_position,
                finished: game.1.finished,
            };
            games_file_store.insert(game.0.to_string(), game_file_store);
        }

        if let Some(open_game) = open_game {
            open_game_file_store = open_game.to_string();
        }

        fs::write(
            PLAYERS_FILE,
            serde_json::to_string_pretty(&players_file_store).unwrap(),
        )
        .unwrap();
        fs::write(
            GAMES_FILE,
            serde_json::to_string_pretty(&games_file_store).unwrap(),
        )
        .unwrap();
        fs::write(
            OPEN_GAME_FILE,
            serde_json::to_string_pretty(&open_game_file_store).unwrap(),
        )
        .unwrap();
    }
}

fn import_players() -> HashMap<Uuid, Player> {
    let unprocessed_players = fs::read_to_string(PLAYERS_FILE)
        .ok()
        .and_then(|players| serde_json::from_str::<HashMap<String, PlayerFileStore>>(&players).ok())
        .unwrap_or_default();

    if unprocessed_players.is_empty() {
        return HashMap::new();
    }

    let mut players: HashMap<Uuid, Player> = HashMap::new();

    for unprocessed_player in unprocessed_players {
        let player_id = Uuid::parse_str(&unprocessed_player.0).unwrap();
        let player_file_store = unprocessed_player.1;
        let player = Player {
            id: player_id,
            token: player_file_store.token,
            current_game_id: Uuid::parse_str(&player_file_store.current_game_id).unwrap(),
            in_game: player_file_store.in_game,
        };
        players.insert(player_id, player);
    }

    return players;
}

fn import_games() -> HashMap<Uuid, Game> {
    let unprocessed_games = fs::read_to_string(GAMES_FILE)
        .ok()
        .and_then(|games| serde_json::from_str::<HashMap<String, GameFileStore>>(&games).ok())
        .unwrap_or_default();

    if unprocessed_games.is_empty() {
        return HashMap::new();
    }

    let mut games: HashMap<Uuid, Game> = HashMap::new();

    for unprocessed_game in unprocessed_games {
        let game_id = Uuid::parse_str(&unprocessed_game.0).unwrap();
        let game_file_store = unprocessed_game.1;
        let game: Game = Game {
            white_player: Uuid::parse_str(&game_file_store.white_player).unwrap(),
            black_player: Uuid::parse_str(&game_file_store.black_player).unwrap(),
            player_to_play: Uuid::parse_str(&game_file_store.player_to_play).unwrap(),
            board_position: game_file_store.board_position,
            finished: game_file_store.finished,
        };
        games.insert(game_id, game);
    }

    return games;
}

fn import_open_game() -> Option<Uuid> {
    let open_game = fs::read_to_string(OPEN_GAME_FILE)
        .ok()
        .and_then(|open_game| serde_json::from_str::<OpenGameFileStore>(&open_game).ok())
        .unwrap_or_default();

    if open_game.is_empty() {
        return None;
    }

    let open_game_id = Uuid::parse_str(&open_game).unwrap();

    return Some(open_game_id);
}
