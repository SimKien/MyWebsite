use chess_engine::{
    get_bitboard, get_board, get_piece_at, get_position_from_string, get_starting_board,
    get_starting_fen, Bitboard,
};

use super::Command;

const GET_DEFAULT_BOARD_COMMAND: Command = Command {
    name: "get_default_board",
    min_args: 0,
    max_args: 0,
    executor: get_default_board_command,
    next_level_commands: &[],
    valid: true,
};

const GET_DEFAULT_FEN_COMMAND: Command = Command {
    name: "get_default_fen",
    min_args: 0,
    max_args: 0,
    executor: get_default_fen_command,
    next_level_commands: &[],
    valid: true,
};

const GET_BITBOARD_COMMAND: Command = Command {
    name: "get_bitboard_from_fen",
    min_args: 6,
    max_args: 6,
    executor: get_bitboard_from_fen_command,
    next_level_commands: &[],
    valid: true,
};

const GET_BITBOARD_FROM_HEX_COMMAND: Command = Command {
    name: "get_bitboard_from_hex",
    min_args: 1,
    max_args: 1,
    executor: get_bitboard_from_hex_command,
    next_level_commands: &[],
    valid: true,
};

const GET_BOARD_COMMAND: Command = Command {
    name: "get_board",
    min_args: 6,
    max_args: 6,
    executor: get_board_command,
    next_level_commands: &[],
    valid: true,
};

const GET_PIECE_AT_COMMAND: Command = Command {
    name: "get_piece_at",
    min_args: 7,
    max_args: 7,
    executor: get_piece_at_command,
    next_level_commands: &[],
    valid: true,
};

pub const CHESS_BOARD_FORWARD_COMMANDS: &[Command; 6] = &[
    GET_DEFAULT_BOARD_COMMAND,
    GET_DEFAULT_FEN_COMMAND,
    GET_BITBOARD_COMMAND,
    GET_BITBOARD_FROM_HEX_COMMAND,
    GET_BOARD_COMMAND,
    GET_PIECE_AT_COMMAND,
];

pub fn get_default_board_command(_: Vec<String>) {
    let board = get_starting_board();
    println!("{}", board);
}

pub fn get_default_fen_command(_: Vec<String>) {
    let fen = get_starting_fen();
    println!("{}", fen);
}

pub fn get_bitboard_from_fen_command(args: Vec<String>) {
    let fen = &args.join(" ");
    let bitboard = get_bitboard(fen);
    if bitboard.is_err() {
        println!("{}", bitboard.err().unwrap().to_string());
        return;
    }
    println!("{}", bitboard.unwrap().to_string());
}

pub fn get_bitboard_from_hex_command(args: Vec<String>) {
    let hex = &args[0];
    let board_int = u64::from_str_radix(hex, 16);
    if board_int.is_err() {
        println!("Invalid position hex");
        return;
    }
    let board = board_int.unwrap();
    let bitboard = Bitboard::new(board);
    println!("{}", bitboard.to_string());
}

pub fn get_board_command(args: Vec<String>) {
    let fen = &args.join(" ");
    let board = get_board(fen);
    if board.is_err() {
        println!("{}", board.err().unwrap().to_string());
        return;
    }
    println!("{}", board.unwrap());
}

pub fn get_piece_at_command(args: Vec<String>) {
    let fen = &args[0..6].join(" ");
    let position = &args[6];
    let position = get_position_from_string(position);
    if position.is_err() {
        println!("{}", position.err().unwrap().to_string());
        return;
    }
    let piece = get_piece_at(fen, position.unwrap());
    if piece.is_err() {
        println!("{}", piece.err().unwrap().to_string());
        return;
    }
    println!("{}", piece.unwrap());
}
