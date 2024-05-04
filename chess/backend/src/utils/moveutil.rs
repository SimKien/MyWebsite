use std::collections::HashMap;

use comlib::SpecialMove;

use crate::{
    utils::{get_castling_options_from_fen, get_en_passant_from_fen},
    COLOR_BLACK, COLOR_WHITE,
};

use super::get_board_position_from_fen;

#[derive(Debug, Clone)]
struct Piece {
    piece_type: String,
    piece_color: String,
    position_map: u64,
}

struct Position {
    map: u64,
}

impl Position {
    fn new() -> Self {
        Self { map: 0 }
    }

    fn move_up(&mut self, steps: i32) -> bool {
        if steps < 0 {
            for _ in 0..-steps {
                if is_lower_edge(&self.map) {
                    return false;
                }
                self.map >>= 8;
            }
            return true;
        } else {
            for _ in 0..steps {
                if is_upper_edge(&self.map) {
                    return false;
                }
                self.map <<= 8;
            }
            return true;
        }
    }

    fn move_right(&mut self, steps: i32) -> bool {
        if steps < 0 {
            for _ in 0..-steps {
                if is_left_edge(&self.map) {
                    return false;
                }
                self.map <<= 1;
            }
            return true;
        } else {
            for _ in 0..steps {
                if is_right_edge(&self.map) {
                    return false;
                }
                self.map >>= 1;
            }
            return true;
        }
    }
}

type PossibleMove = (i32, i32);

const BISHOP_MOVES: [PossibleMove; 4] = [(1, 1), (1, -1), (-1, 1), (-1, -1)];
const ROOK_MOVES: [PossibleMove; 4] = [(1, 0), (0, 1), (-1, 0), (0, -1)];
const KNIGHT_MOVES: [PossibleMove; 8] = [
    (1, 2),
    (2, 1),
    (2, -1),
    (1, -2),
    (-1, -2),
    (-2, -1),
    (-2, 1),
    (-1, 2),
];
const KING_MOVES: [PossibleMove; 8] = [
    (1, 0),
    (1, 1),
    (0, 1),
    (-1, 1),
    (-1, 0),
    (-1, -1),
    (0, -1),
    (1, -1),
];
const QUEEN_MOVES: [PossibleMove; 8] = [
    (1, 0),
    (1, 1),
    (0, 1),
    (-1, 1),
    (-1, 0),
    (-1, -1),
    (0, -1),
    (1, -1),
];

pub fn calculate_valid_moves(
    fen: String,
    player_to_play: String,
) -> (HashMap<String, Vec<String>>, Vec<SpecialMove>) {
    let board_position = get_board_position_from_fen(&fen);
    let castling_options = get_castling_options_from_fen(&fen);
    let en_passant = get_en_passant_from_fen(&fen);

    let (white_pieces, black_pieces) = calculate_piece_maps(&board_position);

    let mut white_map: u64 = 0;
    for piece in &white_pieces {
        white_map |= piece.position_map;
    }

    let mut black_map: u64 = 0;
    for piece in &black_pieces {
        black_map |= piece.position_map;
    }

    let all_pieces: u64 = white_map | black_map;

    let mut valid_moves: HashMap<String, Vec<String>> = HashMap::new();
    let special_moves = Vec::new();

    let regarded_pieces = if player_to_play == COLOR_WHITE {
        white_pieces.clone()
    } else {
        black_pieces.clone()
    };

    for piece in &regarded_pieces {
        let new_valid_moves = 
        if piece.piece_type == "P" {
            calculate_moves_for_pawn(piece, &all_pieces, &black_map, &white_map)
        } else if piece.piece_type == "B" {
            calculate_moves_from_bishop(piece, &all_pieces, &black_map, &white_map)
        } else if piece.piece_type == "N" {
            calculate_moves_for_knight(piece, &all_pieces, &black_map, &white_map)
        }  else if piece.piece_type == "K" {
            calculate_moves_for_king(piece, &all_pieces, &black_map, &white_map)
        } else if piece.piece_type == "Q" {
            calculate_moves_for_queen(piece, &all_pieces, &black_map, &white_map)
        } else if piece.piece_type == "R" {
            calculate_moves_for_rook(piece, &all_pieces, &black_map, &white_map)
        } else {
            Vec::new()
        };
        valid_moves.insert(get_position_from_map(&piece.position_map), new_valid_moves);
    }

    return (valid_moves, special_moves);
}

fn calculate_moves_for_rook(
    piece: &Piece,
    all_pieces: &u64,
    black_map: &u64,
    white_map: &u64,
) -> Vec<String> {
    let position = piece.position_map;
    let mut valid_moves = Vec::new();
    let opponent_map = if piece.piece_color == COLOR_WHITE {
        black_map
    } else {
        white_map
    };
    let mut moves = Position::new();
    moves.map = position;

    for (x, y) in ROOK_MOVES.iter() {
        let mut worked = true;
        while worked {
            worked = moves.move_right(*x) && moves.move_up(*y);
            if worked {
                if moves.map & all_pieces != 0 {
                    if moves.map & opponent_map != 0 {
                        valid_moves.push(moves.map);
                    }
                    break;
                }
                valid_moves.push(moves.map);
            }
        }
        moves.map = position;
    }

    return valid_moves
        .iter()
        .map(|x| get_position_from_map(x))
        .collect();
}

fn calculate_moves_for_queen(
    piece: &Piece,
    all_pieces: &u64,
    black_map: &u64,
    white_map: &u64,
) -> Vec<String> {
    let position = piece.position_map;
    let mut valid_moves = Vec::new();
    let opponent_map = if piece.piece_color == COLOR_WHITE {
        black_map
    } else {
        white_map
    };
    let mut moves = Position::new();
    moves.map = position;

    for (x, y) in QUEEN_MOVES.iter() {
        let mut worked = true;
        while worked {
            worked = moves.move_right(*x) && moves.move_up(*y);
            if worked {
                if moves.map & all_pieces != 0 {
                    if moves.map & opponent_map != 0 {
                        valid_moves.push(moves.map);
                    }
                    break;
                }
                valid_moves.push(moves.map);
            }
        }
        moves.map = position;
    }

    return valid_moves
        .iter()
        .map(|x| get_position_from_map(x))
        .collect();
}

fn calculate_moves_for_king(
    piece: &Piece,
    all_pieces: &u64,
    black_map: &u64,
    white_map: &u64,
) -> Vec<String> {
    let position = piece.position_map;
    let mut valid_moves = Vec::new();
    let opponent_map = if piece.piece_color == COLOR_WHITE {
        black_map
    } else {
        white_map
    };
    let mut moves = Position::new();
    moves.map = position;

    for (x, y) in KING_MOVES.iter() {
        let worked = moves.move_right(*x) && moves.move_up(*y);
        if worked {
            if moves.map & all_pieces == 0 {
                valid_moves.push(moves.map);
            } else if moves.map & opponent_map != 0 {
                valid_moves.push(moves.map);
            }
        }
        moves.map = position;
    }

    return valid_moves
        .iter()
        .map(|x| get_position_from_map(x))
        .collect();
}

fn calculate_moves_for_knight(
    piece: &Piece,
    all_pieces: &u64,
    black_map: &u64,
    white_map: &u64,
) -> Vec<String> {
    let position = piece.position_map;
    let mut valid_moves = Vec::new();
    let opponent_map = if piece.piece_color == COLOR_WHITE {
        black_map
    } else {
        white_map
    };
    let mut moves = Position::new();
    moves.map = position;

    for (x, y) in KNIGHT_MOVES.iter() {
        let worked = moves.move_right(*x) && moves.move_up(*y);
        if worked {
            if moves.map & all_pieces == 0 {
                valid_moves.push(moves.map);
            } else if moves.map & opponent_map != 0 {
                valid_moves.push(moves.map);
            }
        }
        moves.map = position;
    }

    return valid_moves
        .iter()
        .map(|x| get_position_from_map(x))
        .collect();
}

fn calculate_moves_from_bishop(
    piece: &Piece,
    all_pieces: &u64,
    black_map: &u64,
    white_map: &u64,
) -> Vec<String> {
    let position = piece.position_map;
    let mut valid_moves = Vec::new();
    let opponent_map = if piece.piece_color == COLOR_WHITE {
        black_map
    } else {
        white_map
    };
    let mut moves = Position::new();
    moves.map = position;

    for (x, y) in BISHOP_MOVES.iter() {
        let mut worked = true;
        while worked {
            worked = moves.move_right(*x) && moves.move_up(*y);
            if worked {
                if moves.map & all_pieces != 0 {
                    if moves.map & opponent_map != 0 {
                        valid_moves.push(moves.map);
                    }
                    break;
                }
                valid_moves.push(moves.map);
            }
        }
        moves.map = position;
    }

    return valid_moves
        .iter()
        .map(|x| get_position_from_map(x))
        .collect();
}

fn calculate_moves_for_pawn(
    piece: &Piece,
    all_pieces: &u64,
    black_map: &u64,
    white_map: &u64,
) -> Vec<String> {
    let position = piece.position_map;
    let mut valid_moves = Vec::new();
    let mut starter_pos = 0x000000000000FF00;
    let mut move_direction = 1;
    let mut opponent_map = black_map;
    if piece.piece_color == COLOR_BLACK {
        starter_pos = 0x00FF000000000000;
        move_direction = -1;
        opponent_map = white_map;
    }

    let mut moves = Position::new();
    moves.map = position;
    let worked = moves.move_up(move_direction * 1);
    if !worked {
        return Vec::new();
    }
    if moves.map & all_pieces == 0 {
        valid_moves.push(moves.map);
        if position & starter_pos != 0 {
            moves.move_up(move_direction * 1);
            if moves.map & all_pieces == 0 {
                valid_moves.push(moves.map);
            }
        }
    }
    moves.map = position;
    let worked = moves.move_right(1) && moves.move_up(move_direction * 1);
    if worked {
        if moves.map & opponent_map != 0 {
            valid_moves.push(moves.map);
        }
    }
    moves.map = position;
    let worked = moves.move_right(-1) && moves.move_up(move_direction * 1);
    if worked {
        if moves.map & opponent_map != 0 {
            valid_moves.push(moves.map);
        }
    }
    return valid_moves
        .iter()
        .map(|x| get_position_from_map(x))
        .collect();
}

fn is_upper_edge(map: &u64) -> bool {
    return map & 0xFF00000000000000 != 0;
}

fn is_lower_edge(map: &u64) -> bool {
    return map & 0x00000000000000FF != 0;
}

fn is_right_edge(map: &u64) -> bool {
    return map & 0x0101010101010101 != 0;
}

fn is_left_edge(map: &u64) -> bool {
    return map & 0x8080808080808080 != 0;
}

fn get_position_from_map(map: &u64) -> String {
    let mut result = String::new();
    let mut pos: u8 = 0;
    for i in 0..64 {
        if map & (1 << (63 - i)) != 0 {
            pos = i;
            break;
        }
    }
    let row = pos / 8;
    let col = pos % 8;
    result.push((col + 97) as char);
    result.push((56 - row) as char);
    return result;
}

fn calculate_piece_maps(board_position: &String) -> (Vec<Piece>, Vec<Piece>) {
    let mut white_pieces: Vec<Piece> = Vec::new();
    let mut black_pieces: Vec<Piece> = Vec::new();

    let mut row = 0;
    let mut col = 0;

    for letter in board_position.chars() {
        if letter == '/' {
            row += 1;
            col = 0;
        } else {
            if letter.is_digit(10) {
                col += letter.to_digit(10).unwrap();
            } else {
                let piece = Piece {
                    piece_type: letter.to_string().to_uppercase(),
                    piece_color: if letter.is_uppercase() {
                        String::from(COLOR_WHITE)
                    } else {
                        String::from(COLOR_BLACK)
                    },
                    position_map: 1 << (63 - (row * 8 + col)),
                };
                if piece.piece_color == COLOR_WHITE {
                    white_pieces.push(piece);
                } else {
                    black_pieces.push(piece);
                }
                col += 1;
            }
        }
    }
    return (white_pieces, black_pieces);
}

/*
fn print_map(map: &u64) {
    let mut result = String::new();
    for i in 0..64 {
        if map & (1 << (63 - i)) != 0 {
            result.push('1');
        } else {
            result.push('0');
        }
        if i % 8 == 7 {
            result.push('\n');
        } else {
            result.push(' ');
        }
    }
    println!("{}", result);
}
*/
