use axum::{extract::{Query, State}, Json};
use comlib::UserValid;
use uuid::Uuid;

use crate::{state::SharedState, util::validate_user, UserQuery};

/*
Checks if the user is valid by checking if the user_id and token are in the state.users hashmap
*/
pub async fn is_user_valid(
    State(state): State<SharedState>,
    Query(user_information): Query<UserQuery>,
) -> Json<UserValid> {
    let user_id = user_information.user_id.clone();
    let user_uuid_parse = Uuid::parse_str(&user_id);

    if user_uuid_parse.is_err() {
        return Json(UserValid { valid: false });
    }

    let user_uuid = user_uuid_parse.unwrap();

    let locked_state = state.lock().await;

    let user_get = locked_state.users.get(&user_uuid);

    if user_get.is_none() {
        return Json(UserValid { valid: false });
    }

    let user = user_get.unwrap();

    let user_valid = UserValid {
        valid: validate_user(&user_information, user),
    };

    Json(user_valid)
}