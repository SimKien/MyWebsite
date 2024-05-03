use std::collections::HashMap;

use axum::{extract::{Query, State}, Json};
use comlib::{SpecialMove, ValidMovesInformation};
use uuid::Uuid;

use crate::{state::SharedState, util::{calculate_valid_moves, validate_user}, UserQuery};

pub async fn get_valid_moves(
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

    if current_game.player_to_play != current_player.user.user_id {
        return Json(ValidMovesInformation {
            valid_moves: HashMap::<String, Vec<String>>::new(),
            special_moves: Vec::<SpecialMove>::new(),
        });
    }

    let valid_moves = calculate_valid_moves();

    Json(valid_moves)
}