use regex::Regex;

use crate::{
    piece_features::{CastleType, GamePiece, PieceType},
    types::Position,
    Color, BOARD_SIZE,
};

pub const POSITION_STRING_REGEX: &str = r"^[a-h][1-8]$";

/*
    Converts a position string into a position bitboard
*/
pub fn get_position_from_position_string(pos: &String) -> Position {
    let column = 'h' as u8 - pos.chars().nth(0).unwrap() as u8;
    let row = pos.chars().nth(1).unwrap() as u8 - '1' as u8;
    return Position {
        board: (1 << column) << (row * BOARD_SIZE),
    };
}

/*
    Returns whether the position string is valid
*/
pub fn position_string_valid(pos: &String) -> bool {
    return Regex::new(POSITION_STRING_REGEX).unwrap().is_match(pos);
}

/*
    Returns the game pieces on the board
*/
pub fn get_game_pieces(board: &String) -> Vec<GamePiece> {
    let mut pieces = Vec::new();
    let mut row = BOARD_SIZE;
    let mut column = 0;
    for (_, c) in board.chars().enumerate() {
        if c == '/' {
            row -= 1;
            column = 0;
        } else if c.is_digit(10) {
            column += c.to_digit(10).unwrap() as u8;
        } else {
            let position = Position {
                board: (1 as u64) << (63 - ((BOARD_SIZE - row) * BOARD_SIZE + column)),
            };
            pieces.push(GamePiece::new(
                PieceType::from_char(c.to_ascii_uppercase()),
                if c.is_uppercase() {
                    Color::White
                } else {
                    Color::Black
                },
                position,
            ));
            column += 1;
        }
    }
    return pieces;
}

/*
    Returns the castling right based on the character
*/
pub fn get_castling_right_from_char(c: char) -> Option<CastleType> {
    return match c {
        'K' => Some(CastleType::WhiteKingSide),
        'Q' => Some(CastleType::WhiteQueenSide),
        'k' => Some(CastleType::BlackKingSide),
        'q' => Some(CastleType::BlackQueenSide),
        _ => None,
    };
}
