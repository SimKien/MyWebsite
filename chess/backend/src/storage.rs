use std::{collections::HashMap, fs, sync::Arc, time::Duration};

use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::{state::AppState, Game, PendingGame, Player, User};

#[derive(Debug, Clone, Deserialize, Serialize)]
struct UserFileStore {
    id: String,
    token: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct PlayerFileStore {
    id: String,
    current_game_id: String,
    in_game: bool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct GameFileStore {
    white_player: String,
    black_player: String,
    player_to_play: String,
    board_position: String,
    finished: bool,
}

type PendingGameFileStore = String;

const USER_FILE: &str = "users.json";

const PLAYERS_FILE: &str = "players.json";

const GAMES_FILE: &str = "games.json";

const PENDING_GAME_FILE: &str = "pending_game.json";

pub async fn write_state_loop(state: Arc<Mutex<AppState>>) {
    let mut interval = tokio::time::interval(Duration::from_millis(1000));
    loop {
        interval.tick().await;

        let locked_state = state.lock().await;

        let users = locked_state.users.clone();
        let players = locked_state.players.clone();
        let games = locked_state.games.clone();
        let pending_game = locked_state.pending_game.clone();

        let mut users_file_store: HashMap<String, UserFileStore> = HashMap::new();
        let mut players_file_store: HashMap<String, PlayerFileStore> = HashMap::new();
        let mut games_file_store: HashMap<String, GameFileStore> = HashMap::new();
        let mut pending_game_file_store: PendingGameFileStore = String::new();

        for user in users {
            let user_file_store = UserFileStore {
                id: user.1.user_id.to_string(),
                token: user.1.token,
            };
            users_file_store.insert(user.0.to_string(), user_file_store);
        }

        for player in players {
            let player_file_store = PlayerFileStore {
                id: player.1.user.user_id.to_string(),
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

        if let Some(pending_game) = pending_game.game {
            pending_game_file_store = pending_game.to_string();
        }

        fs::write(
            USER_FILE,
            serde_json::to_string_pretty(&users_file_store).unwrap(),
        )
        .unwrap();
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
            PENDING_GAME_FILE,
            serde_json::to_string_pretty(&pending_game_file_store).unwrap(),
        )
        .unwrap();
    }
}

pub fn import_users() -> HashMap<Uuid, User> {
    let unprocessed_users = fs::read_to_string(USER_FILE)
        .ok()
        .and_then(|users| serde_json::from_str::<HashMap<String, UserFileStore>>(&users).ok())
        .unwrap_or_default();

    if unprocessed_users.is_empty() {
        return HashMap::new();
    }

    let mut users: HashMap<Uuid, User> = HashMap::new();

    for unprocessed_user in unprocessed_users {
        let user_id = Uuid::parse_str(&unprocessed_user.0).unwrap();
        let user_file_store = unprocessed_user.1;
        let user = User {
            user_id,
            token: user_file_store.token,
        };
        users.insert(user_id, user);
    }

    return users;
}

pub fn import_players(users: &HashMap<Uuid, User>) -> HashMap<Uuid, Player> {
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
        let user = users.get(&Uuid::parse_str(&player_file_store.id).unwrap()).unwrap().clone();
        let player = Player {
            user: user,
            current_game_id: Uuid::parse_str(&player_file_store.current_game_id).unwrap(),
            in_game: player_file_store.in_game,
        };
        players.insert(player_id, player);
    }

    return players;
}

pub fn import_games() -> HashMap<Uuid, Game> {
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

pub fn import_pending_game() -> PendingGame {
    let pending_game = fs::read_to_string(PENDING_GAME_FILE)
        .ok()
        .and_then(|pending_game| serde_json::from_str::<PendingGameFileStore>(&pending_game).ok())
        .unwrap_or_default();

    if pending_game.is_empty() {
        return PendingGame::new();
    }

    let pending_game_id = Uuid::parse_str(&pending_game).unwrap();

    return PendingGame::new_with_game(pending_game_id);
}