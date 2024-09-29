use crate::{
    piece_features::{GamePiece, PieceType},
    Bitboard, Color, Position,
};

/*
    Returns the piece at the square in a list of game pieces
*/
pub fn get_piece_at_square(pieces: &Vec<GamePiece>, square: &Position) -> GamePiece {
    for piece in pieces {
        if piece.position.board == square.board {
            return piece.clone();
        }
    }
    return GamePiece::new(PieceType::None, Color::White, Position::new(0));
}

/*
    Converts a list of game pieces into a board string
*/
pub fn get_board_from_pieces(pieces: &Vec<GamePiece>) -> String {
    let mut result = Bitboard::empty().to_string();
    for piece in pieces {
        let pos = piece.position.to_string().find("1").unwrap();
        result.replace_range(pos..pos + 1, &piece.to_piece().to_string());
    }
    result = result.replace("0", "-");
    return result;
}

/*
    Returns the bitboard of the color on the board
*/
pub fn get_bitboard_of_color(pieces: &Vec<GamePiece>, color: &Color) -> Bitboard {
    let color_pieces: Vec<&GamePiece> =
        pieces.iter().filter(|p| p.color == color.clone()).collect();
    let mut result: u64 = 0;
    for piece in color_pieces {
        result |= piece.position.board;
    }
    return Bitboard { board: result };
}
