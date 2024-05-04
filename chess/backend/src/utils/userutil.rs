use crate::{Game, Player, User, UserQuery, COLOR_BLACK, COLOR_WHITE};

pub fn validate_user(transfered_user: &UserQuery, actual_user: Option<&User>) -> bool {
    if actual_user.is_none() {
        return false;
    }

    let actual_user = actual_user.unwrap();

    let actual_id_string = actual_user.user_id.to_string();
    return transfered_user.user_id == actual_id_string
        && transfered_user.token == actual_user.token;
}

pub fn get_player_color(player: &Player, game: &Game) -> String {
    if game.white_player.to_string() == player.user.user_id.to_string() {
        String::from(COLOR_WHITE)
    } else {
        String::from(COLOR_BLACK)
    }
}