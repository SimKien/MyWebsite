use axum::{extract::State, Json};
use comlib::UserInformation;
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use uuid::Uuid;

use crate::{state::SharedState, User, TOKEN_LENGTH};

/*
Creates a new user with a random token and a random user_id and saves it in the state.users hashmap
*/
pub async fn get_new_user(State(state): State<SharedState>) -> Json<UserInformation> {
    let user_id = Uuid::new_v4();
    let random_token: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(TOKEN_LENGTH)
        .map(char::from)
        .collect();

    let user = UserInformation {
        id: user_id.to_string(),
        token: random_token.clone(),
    };

    let mut state = state.lock().await;

    let new_user = User::new(user_id, random_token.clone());

    state.users.insert(user_id, new_user);

    Json(user)
}