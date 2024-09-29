use axum::{extract::{Query, State}, Json};
use comlib::PlayerGameInformation;
use uuid::Uuid;

use crate::{state::SharedState, utils::{get_player_color, validate_user}, UserQuery, COLOR_BLACK, COLOR_WHITE, INVALID_ID};

/*
lets user join existing game or creates new game
*/
pub async fn get_user_game(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<PlayerGameInformation> {
    let user_id = user_information.user_id.clone();
    let user_uuid = Uuid::parse_str(&user_id).unwrap();

    let mut locked_state = state.lock().await;

    if !validate_user(
        &user_information,
        locked_state.users.get(&user_uuid),
    ) {
        return Json(PlayerGameInformation {
            id: user_information.user_id,
            token: user_information.token,
            color: String::from(""),
        });
    }

    let current_player_option = locked_state.players.get(&user_uuid);

    let mut current_player = match current_player_option {
        None => {
            let user = locked_state.users.get(&user_uuid).unwrap().clone();
            let new_player = crate::Player::new(user, INVALID_ID, false);
            locked_state.players.insert(user_uuid, new_player);
            locked_state.players.get(&user_uuid).unwrap().clone()
        }
        Some(_) => current_player_option.unwrap().clone(),
    };

    if current_player.in_game {
        let current_game = locked_state
            .games
            .get(&current_player.current_game_id)
            .unwrap();
        let color = get_player_color(&current_player, current_game);

        let res = PlayerGameInformation {
            id: user_information.user_id,
            token: user_information.token,
            color,
        };

        return Json(res);
    }

    let mut pending_game = locked_state.pending_game.clone();

    let player_color = if pending_game.game.is_some() {
        String::from(COLOR_BLACK)
    } else {
        String::from(COLOR_WHITE)
    };

    let update_state = pending_game.update(&user_uuid, &locked_state);
    locked_state.games.insert(update_state.0, update_state.1);
    locked_state.pending_game = pending_game;

    current_player.in_game = true;
    current_player.current_game_id = update_state.0;
    locked_state.players.insert(user_uuid, current_player);

    let result = PlayerGameInformation {
        id: user_information.user_id,
        token: user_information.token,
        color: player_color,
    };

    Json(result)
}