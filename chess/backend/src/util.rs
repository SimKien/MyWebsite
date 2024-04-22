use std::collections::HashMap;

use comlib::ValidMovesInformation;

use crate::{Game, Player, User, UserQuery, COLOR_BLACK, COLOR_WHITE};

pub fn calculate_valid_moves() -> ValidMovesInformation {
    //TODO man braucht die aktuelle Position und die Farbe des Spielers als Argumente

    let mut valid_moves_map: HashMap<String, Vec<String>> = HashMap::new();
    valid_moves_map.insert(String::from("e2"), vec![String::from("e4")]);
    let special_moves = Vec::new();

    ValidMovesInformation {
        valid_moves: valid_moves_map,
        special_moves: special_moves,
    }
}

pub fn validate_user(transfered_user: &UserQuery, actual_user: &User) -> bool {
    let actual_id_string = actual_user.id.to_string();
    return transfered_user.user_id == actual_id_string
        && transfered_user.token == actual_user.token;
}

pub fn get_player_color(player: &Player, game: &Game) -> String {
    if game.white_player.to_string() == player.user.id.to_string() {
        String::from(COLOR_WHITE)
    } else {
        String::from(COLOR_BLACK)
    }
}