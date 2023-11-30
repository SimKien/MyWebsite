use std::collections::HashMap;

use comlib::ValidMovesInformation;

use crate::{Game, Player, PlayerQuery};

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

pub fn validate_player(transfered_player: &PlayerQuery, actual_player: &Player) -> bool {
    let actual_id_string = actual_player.id.to_string();
    return transfered_player.player_id == actual_id_string
        && transfered_player.token == actual_player.token;
}

pub fn get_player_color(player: &Player, game: &Game) -> String {
    if game.white_player.to_string() == player.id.to_string() {
        String::from("white")
    } else {
        String::from("black")
    }
}
