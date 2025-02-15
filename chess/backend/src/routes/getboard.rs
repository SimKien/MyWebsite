use axum::{extract::{Query, State}, Json};
use comlib::BoardPositionInformation;
use uuid::Uuid;

use crate::{state::SharedState, utils::{validate_user, get_board_position_from_fen}, UserQuery, DEFAULT_BOARD_POSITION};

/*
gives the current board position of the user´s current game
*/
pub async fn get_board_position(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<BoardPositionInformation> {
    let user_id = user_information.user_id.clone();
    let user_uuid = Uuid::parse_str(&user_id).unwrap();

    let locked_state = state.lock().await;

    if !validate_user(
        &user_information,
        locked_state.users.get(&user_uuid),
    ) {
        return Json(BoardPositionInformation {
            board_position: String::from(""),
        });
    }

    let current_game_id = locked_state
        .players
        .get(&user_uuid)
        .unwrap()
        .current_game_id;

    let current_game = locked_state.games.get(&current_game_id).unwrap().clone();
    let board_position = get_board_position_from_fen(&current_game.fen);

    let board_position = BoardPositionInformation {
        board_position
    };
    Json(board_position)
}

/*
gives the default chess board position
*/
pub async fn get_default_board() -> Json<BoardPositionInformation> {
    Json(BoardPositionInformation {
        board_position: String::from(DEFAULT_BOARD_POSITION),
    })
}