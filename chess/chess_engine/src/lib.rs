use parser::{get_bitboard_of_color, get_board_from_pieces, get_game_pieces, get_piece_at_square};
pub use types::*;

mod board;
mod fen;
mod parser;
mod piece_features;
mod types;
mod util;

pub const BOARD_SIZE: u8 = 8;
pub const DEFAULT_BOARD: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
pub const DEFAULT_FEN: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/*
    Returns the FEN board string of the starting position
*/
pub fn get_starting_board() -> String {
    return DEFAULT_BOARD.to_string();
}

/*
    Returns the FEN string of the starting position
*/
pub fn get_starting_fen() -> Fen {
    return DEFAULT_FEN.to_string();
}

/*
    Returns the valid moves for the position represented by the fen
*/
pub fn get_valid_moves(fen: &Fen) -> Result<Vec<Move>, ErrorMessage> {
    //TODO: Implement
    println!("get_valid_moves() called with {}!", fen);
    return Ok(Vec::new());
}

/*
    Returns the FEN string of the position after the move is made and whether the move is valid
*/
pub fn make_move(fen: &Fen, mv: &Move) -> Result<Fen, ErrorMessage> {
    //TODO: Implement
    println!("make_move() called with {} and {:?}!", fen, mv);
    return Ok(DEFAULT_FEN.to_string());
}

/*
    Returns whether the game represented by the fen is in check
*/
pub fn is_check(fen: &Fen) -> Result<bool, ErrorMessage> {
    //TODO: Implement
    println!("is_check() called with {}!", fen);
    return Ok(false);
}

/*
    Returns whether the game represented by the fen is a checkmate
*/
pub fn is_checkmate(fen: &Fen) -> Result<bool, ErrorMessage> {
    //TODO: Implement
    println!("is_checkmate() called with {}!", fen);
    return Ok(false);
}

/*
    Returns whether the game represented by the fen is a draw
*/
pub fn is_draw(fen: &Fen) -> Result<bool, ErrorMessage> {
    //TODO: Implement
    println!("is_draw() called with {}!", fen);
    return Ok(false);
}

/*
    Returns whether the game represented by the fen is over (checkmate or draw)
*/
pub fn is_game_over(fen: &Fen) -> Result<bool, ErrorMessage> {
    //TODO: Implement
    println!("is_game_over() called with {}!", fen);
    return Ok(false);
}

/*
    Returns the evaluation of the position represented by the fen
*/
pub fn evaluate_position(fen: &Fen) -> Result<i32, ErrorMessage> {
    //TODO: Implement
    println!("evaluate_position() called with {}!", fen);
    return Ok(0);
}

/*
    Returns whether the fen is a valid FEN string
*/
pub fn is_valid_fen(fen: &Fen) -> bool {
    let fen_decoder = fen::FenDecoder::new(fen.to_string());
    return fen_decoder.fen_valid();
}

/*
    Returns the bitboard representation of the position represented by the fen
*/
pub fn get_bitboard(fen: &Fen) -> Result<Bitboard, ErrorMessage> {
    let fen_decoder = fen::FenDecoder::new(fen.to_string());
    if !fen_decoder.fen_valid() {
        return Err(ErrorMessage::new("Invalid FEN string".to_string()));
    }
    let pieces = get_game_pieces(&fen_decoder.get_board());
    let white_bitboard = get_bitboard_of_color(&pieces, &Color::White);
    let black_bitboard = get_bitboard_of_color(&pieces, &Color::Black);
    return Ok(Bitboard {
        board: white_bitboard.board | black_bitboard.board,
    });
}

/*
    Returns the board of the position represented by the fen
*/
pub fn get_board(fen: &Fen) -> Result<String, ErrorMessage> {
    let fen_decoder = fen::FenDecoder::new(fen.to_string());
    if !fen_decoder.fen_valid() {
        return Err(ErrorMessage::new("Invalid FEN string".to_string()));
    }
    let board = fen_decoder.get_board();
    let pieces = get_game_pieces(&board);
    return Ok(get_board_from_pieces(&pieces));
}

/*
    Returns the piece at the square in the position represented by the fen
*/
pub fn get_piece_at(fen: &Fen, square: Position) -> Result<Piece, ErrorMessage> {
    let fen_decoder = fen::FenDecoder::new(fen.to_string());
    if !fen_decoder.fen_valid() {
        return Err(ErrorMessage::new("Invalid FEN string".to_string()));
    }
    if !parser::position_valid(&square) {
        return Err(ErrorMessage::new("Invalid position".to_string()));
    }
    let pieces = get_game_pieces(&fen_decoder.get_board());
    let piece = get_piece_at_square(&pieces, &square);
    return Ok(piece.to_piece());
}

/*
    Returns the bitboard position of the square represented by the string
*/
pub fn get_position_from_string(square: &String) -> Result<Position, ErrorMessage> {
    if parser::position_string_valid(square) {
        return Ok(parser::get_position_from_position_string(square));
    } else {
        return Err(ErrorMessage::new("Invalid position string".to_string()));
    }
}

/*
    Returns the string representation of the square represented by the bitboard position
*/
pub fn get_string_from_position(position: Position) -> Result<String, ErrorMessage> {
    if parser::position_valid(&position) {
        return Ok(parser::get_position_string_from_position(&position));
    } else {
        return Err(ErrorMessage::new("Invalid position".to_string()));
    }
}

/*
    Says hello from the chess engine
*/
pub fn hello_chess() {
    println!("Hello world from chess_engine!");
}
