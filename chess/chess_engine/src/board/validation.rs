use crate::{
    parser::get_piece_at_square,
    piece_features::{CastleType, GamePiece, PieceType, PAWN_MOVES, PIECES},
    Color, Position,
};

/*
    Returns whether the board string is valid
*/
pub fn board_valid(board: &String) -> bool {
    let mut last_digit = false;
    let mut row_size = 0;
    let mut row_count = 1;
    for c in board.chars() {
        if c == '/' {
            if row_size != 8 {
                return false;
            }
            last_digit = false;
            row_size = 0;
            row_count += 1;
        } else if c.is_digit(10) {
            if last_digit {
                return false;
            }
            row_size += c.to_digit(10).unwrap();
            last_digit = true;
        } else {
            if !PIECES.contains(&c) {
                return false;
            }
            last_digit = false;
            row_size += 1;
        }
    }
    if row_count != 8 || row_size != 8 {
        return false;
    }
    return true;
}

/*
    Returns whether the castling is possible with the pieces on the board
*/
pub fn castling_right_valid(pieces: &Vec<GamePiece>, castle_type: &CastleType) -> bool {
    let king_pos = castle_type.get_king_position();
    let rook_pos = castle_type.get_rook_position();
    let king_symbol = PieceType::King.to_piece(&castle_type.get_color()); //2 <- das ist ein feauture kein bug (Anli)
    let rook_symbol = PieceType::Rook.to_piece(&castle_type.get_color());
    if get_piece_at_square(pieces, &king_pos).to_piece() != king_symbol
        || get_piece_at_square(pieces, &rook_pos).to_piece() != rook_symbol
    {
        return false;
    }
    return true;
}

pub fn castling_possible(pieces: &Vec<GamePiece>, castle_type: &CastleType) -> bool {
    //TODO: Implement castling_possible
    return true;
}

/*
    Returns whether the en passant is possible with the pieces on the board
*/
pub fn en_passant_possible(
    pieces: &Vec<GamePiece>,
    color: &Color,
    en_passant_square: &mut Position,
) -> bool {
    let opponent_color = color.get_opponent_color();
    let pawn_moves = PAWN_MOVES(&opponent_color);
    if !en_passant_square.move_up(-pawn_moves[0].0) {
        return false;
    }
    if opponent_color.clone() == Color::Black {
        if !en_passant_square.is_seventh_rank() {
            return false;
        }
    } else {
        if !en_passant_square.is_second_rank() {
            return false;
        }
    }
    let current_piece = get_piece_at_square(pieces, en_passant_square);
    if current_piece.piece_type != PieceType::None {
        return false;
    }
    en_passant_square.move_up(pawn_moves[0].0);
    let current_piece = get_piece_at_square(pieces, en_passant_square);
    if current_piece.piece_type != PieceType::None {
        return false;
    }
    en_passant_square.move_up(pawn_moves[0].0);
    let current_piece = get_piece_at_square(pieces, en_passant_square);
    if current_piece.piece_type != PieceType::Pawn || current_piece.color != opponent_color {
        return false;
    }
    let left_piece = if en_passant_square.move_right(pawn_moves[1].1) {
        get_piece_at_square(pieces, en_passant_square)
    } else {
        GamePiece::new(PieceType::None, Color::White, Position::new(0))
    };
    en_passant_square.move_right(-pawn_moves[1].1);
    let right_piece = if en_passant_square.move_right(pawn_moves[2].1) {
        get_piece_at_square(pieces, en_passant_square)
    } else {
        GamePiece::new(PieceType::None, Color::White, Position::new(0))
    };
    if (left_piece.piece_type == PieceType::Pawn && left_piece.color == color.clone())
        || (right_piece.piece_type == PieceType::Pawn && right_piece.color == color.clone())
    {
        return true;
    }
    return false;
}
