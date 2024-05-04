fn get_components(fen: &String) -> Vec<&str> {
    fen.split(" ").collect()
}

pub fn get_board_position_from_fen(fen: &String) -> String {
    let components = get_components(fen);

    return String::from(components[0]);
}

pub fn get_castling_options_from_fen(fen: &String) -> String {
    let components = get_components(fen);

    return String::from(components[2]);
}

pub fn get_en_passant_from_fen(fen: &String) -> String {
    let components = get_components(fen);

    return String::from(components[3]);
}