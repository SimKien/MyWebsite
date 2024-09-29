use core::str;

use crate::Color;

/*
    Returns the nth word in the fen string
*/
pub fn get_nth_word(fen: &String, n: usize) -> Option<String> {
    let mut words = fen.split_whitespace();
    if let Some(word) = words.nth(n) {
        return Some(word.to_string());
    }
    return None;
}

/*
    Converts a color to a string
*/
pub fn color_to_string(color: &Color) -> String {
    return match color {
        Color::White => str::from_utf8(&[Color::White as u8]).unwrap().to_string(),
        Color::Black => str::from_utf8(&[Color::Black as u8]).unwrap().to_string(),
    };
}

/*
    Converts a string to a chess color
*/
pub fn string_to_color(color: &String) -> Color {
    return match color.as_str() {
        "w" => Color::White,
        _ => Color::Black,
    };
}

/*
    Converts a u8 to a string
*/
pub fn u8_to_string(u: &u8) -> String {
    return str::from_utf8(&[*u]).unwrap().to_string();
}
