use crate::board::{board_valid, castling_right_valid, en_passant_possible};
use crate::parser::{get_castling_right_from_char, get_game_pieces};
use crate::piece_features::CastleType;
use crate::util::{color_to_string, get_nth_word, is_vector_unique, string_to_color};

use crate::{
    parser::{get_position_from_position_string, position_string_valid},
    types::{Color, Fen, Position},
};

#[derive(Debug)]
pub struct FenDecoder {
    pub fen: Fen,
}

impl FenDecoder {
    pub fn new(fen: Fen) -> FenDecoder {
        FenDecoder { fen: fen }
    }

    pub fn fen_valid(&self) -> bool {
        let parts: Vec<String> = self.fen.split(" ").map(|s| s.to_string()).collect();
        if parts.len() != 6 {
            return false;
        }
        if !board_valid(&parts[0]) {
            return false;
        }
        let pieces = get_game_pieces(&parts[0]);
        if parts[1] != color_to_string(&Color::White) && parts[1] != color_to_string(&Color::Black)
        {
            return false;
        }
        if parts[2] != "-" {
            if parts[2]
                .chars()
                .any(|c| !matches!(c, 'K' | 'Q' | 'k' | 'q'))
                || !is_vector_unique(parts[2].chars().map(|c| c.to_string()).collect())
            {
                return false;
            }
            if parts[2]
                .chars()
                .any(|c| !castling_right_valid(&pieces, &get_castling_right_from_char(c).unwrap()))
            {
                return false;
            }
        }
        if parts[3] != "-" {
            if !position_string_valid(&parts[3]) {
                return false;
            }
            let mut en_passant_square = get_position_from_position_string(&parts[3]);
            if !en_passant_possible(&pieces, &string_to_color(&parts[1]), &mut en_passant_square) {
                return false;
            }
        }
        let halfmove_clock = parts[4].parse::<u8>();
        if halfmove_clock.is_err() {
            return false;
        }
        let fullmove_number = parts[5].parse::<u16>();
        if fullmove_number.is_err() {
            return false;
        }
        let halfmove_clock = halfmove_clock.unwrap();
        let fullmove_number = fullmove_number.unwrap();
        if (halfmove_clock as u16) > (2 * fullmove_number - 1) || fullmove_number == 0 {
            return false;
        }
        return true;
    }

    pub fn get_board(&self) -> String {
        return get_nth_word(&self.fen, 0).unwrap();
    }

    pub fn get_active_color(&self) -> Color {
        let active_color = get_nth_word(&self.fen, 1).unwrap();
        return match active_color.as_str() {
            "w" => Color::White,
            _ => Color::Black,
        };
    }

    pub fn get_castling_rights(&self) -> Vec<CastleType> {
        let castling_rights = get_nth_word(&self.fen, 2).unwrap();
        let mut castling_rights_vec = Vec::new();
        if castling_rights == "-" {
            return castling_rights_vec;
        }
        for c in castling_rights.chars() {
            let castling_right = get_castling_right_from_char(c).unwrap();
            castling_rights_vec.push(castling_right);
        }
        return castling_rights_vec;
    }

    pub fn get_en_passant_square(&self) -> Option<Position> {
        let en_passant_square = get_nth_word(&self.fen, 3).unwrap();
        if en_passant_square == "-" {
            return None;
        }
        return Some(get_position_from_position_string(&en_passant_square));
    }

    pub fn get_halfmove_clock(&self) -> u8 {
        let halfmove_clock = get_nth_word(&self.fen, 4).unwrap();
        return halfmove_clock.parse::<u8>().unwrap();
    }

    pub fn get_fullmove_number(&self) -> u16 {
        let fullmove_number = get_nth_word(&self.fen, 5).unwrap();
        return fullmove_number.parse::<u16>().unwrap();
    }
}
