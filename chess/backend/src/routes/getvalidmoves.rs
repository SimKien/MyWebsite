use std::collections::HashMap;

use axum::{extract::{Query, State}, Json};
use comlib::{SpecialMove, ValidMovesInformation};
use uuid::Uuid;

use crate::{state::SharedState, utils::{calculate_valid_moves, get_player_color, validate_user}, UserQuery};

/*
returns the current validmoves of the player through the current game fen
*/
pub async fn get_valid_moves(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<ValidMovesInformation> {
    let user_id = user_information.user_id.clone();
    let user_uuid = Uuid::parse_str(&user_id).unwrap();

    let locked_state = state.lock().await;

    if !validate_user(
        &user_information,
        locked_state.users.get(&user_uuid),
    ) {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let current_player = locked_state.players.get(&user_uuid).unwrap();

    if !current_player.in_game {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let current_game = locked_state
        .games
        .get(&current_player.current_game_id)
        .unwrap();

    if current_game.player_to_play != current_player.user.user_id {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let fen = current_game.fen.clone();
    let player_to_play = get_player_color(&current_player, &current_game);
    let valid_moves = calculate_valid_moves(fen, player_to_play);

    let result = ValidMovesInformation {
        valid_moves: valid_moves.0,
        special_moves: valid_moves.1
    };

    Json(result)
}