use crate::{
    parser::{get_board_from_pieces, get_position_string_from_position},
    piece_features::{CastleType, GamePiece},
    types::{Color, Position},
    util::{color_to_string, u8_to_string},
    DEFAULT_BOARD,
};

#[derive(Debug)]
pub struct FenBuilder {
    pub board: String,
    pub active_color: Color,
    pub castling_rights: Vec<CastleType>,
    pub en_passant_square: Option<Position>,
    pub halfmove_clock: u8,
    pub fullmove_number: u16,
}

impl FenBuilder {
    pub fn new() -> FenBuilder {
        FenBuilder {
            board: DEFAULT_BOARD.to_string(),
            active_color: Color::White,
            castling_rights: Vec::new(),
            en_passant_square: None,
            halfmove_clock: 0,
            fullmove_number: 1,
        }
    }

    pub fn with_game_pieces(mut self, game_pieces: Vec<GamePiece>) -> FenBuilder {
        let board = get_board_from_pieces(&game_pieces);
        let mut result = String::new();
        for row in board.split("\n") {
            if row.is_empty() {
                break;
            }
            let mut space = 0;
            for c in row.split_whitespace() {
                if c == "-" {
                    space += 1;
                } else {
                    if space != 0 {
                        result.push_str(format!("{}", space).as_str());
                        space = 0;
                    }
                    result.push_str(c);
                }
            }
            if space != 0 {
                result.push_str(format!("{}", space).as_str());
            }
            result.push_str("/");
        }
        result.pop(); // remove the last '/' because it is not needed
        self.board = result;
        self
    }

    pub fn with_board(mut self, board: String) -> FenBuilder {
        self.board = board;
        self
    }

    pub fn with_active_color(mut self, active_color: Color) -> FenBuilder {
        self.active_color = active_color;
        self
    }

    pub fn with_castling_rights(mut self, castling_rights: Vec<CastleType>) -> FenBuilder {
        self.castling_rights = castling_rights;
        self
    }

    pub fn with_en_passant_square(mut self, en_passant_square: Option<Position>) -> FenBuilder {
        self.en_passant_square = en_passant_square;
        self
    }

    pub fn with_halfmove_clock(mut self, halfmove_clock: u8) -> FenBuilder {
        self.halfmove_clock = halfmove_clock;
        self
    }

    pub fn with_fullmove_number(mut self, fullmove_number: u16) -> FenBuilder {
        self.fullmove_number = fullmove_number;
        self
    }

    pub fn generate_fen(self) -> String {
        let mut result = String::new();
        result.push_str(self.board.as_str());
        result.push_str(format!(" {}", color_to_string(&self.active_color)).as_str());
        if self.castling_rights.is_empty() {
            result.push_str(" -");
        } else {
            result.push_str(
                format!(
                    " {}",
                    self.castling_rights
                        .iter()
                        .map(|c| u8_to_string(&(c.clone() as u8)))
                        .collect::<String>()
                )
                .as_str(),
            );
        }
        if let Some(position) = self.en_passant_square {
            result.push_str(format!(" {}", get_position_string_from_position(&position)).as_str());
        } else {
            result.push_str(" -");
        }
        result.push_str(format!(" {}", self.halfmove_clock).as_str());
        result.push_str(format!(" {}", self.fullmove_number).as_str());
        return result;
    }
}
