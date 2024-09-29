use std::collections::HashMap;

use uuid::Uuid;

use crate::{Client, Game, PendingGame, Player, User};


pub type SharedState = std::sync::Arc<tokio::sync::Mutex<AppState>>;


#[derive(Debug, Clone)]
pub struct AppState {
    pub clients: HashMap<Uuid, Client>,
    pub games: HashMap<Uuid, Game>,
    pub pending_game: PendingGame,
    pub users: HashMap<Uuid, User>,
    pub players: HashMap<Uuid, Player>,
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

impl AppState {
    pub fn new() -> Self {
        Self {
            clients: HashMap::new(),
            games: HashMap::new(),
            pending_game: PendingGame::new(),
            users: HashMap::new(),
            players: HashMap::new(),
        }
    }
}