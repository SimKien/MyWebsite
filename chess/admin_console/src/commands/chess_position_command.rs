use chess_engine::{get_position_from_string, get_string_from_position, Position};

use super::Command;

const STRING_POSITION_COMMAND: Command = Command {
    name: "from_string",
    min_args: 1,
    max_args: 1,
    executor: chess_position_from_string_command,
    next_level_commands: &[],
    valid: true,
};

const INT_POSITION_COMMAND: Command = Command {
    name: "from_int",
    min_args: 1,
    max_args: 1,
    executor: chess_position_from_int_command,
    next_level_commands: &[],
    valid: true,
};

const HEX_POSITION_COMMAND: Command = Command {
    name: "from_hex",
    min_args: 1,
    max_args: 1,
    executor: chess_position_from_hex_command,
    next_level_commands: &[],
    valid: true,
};

pub const CHESS_POSITION_FORWARD_COMMANDS: &[Command; 3] = &[
    STRING_POSITION_COMMAND,
    INT_POSITION_COMMAND,
    HEX_POSITION_COMMAND,
];

fn chess_position_from_string_command(args: Vec<String>) {
    let position_string = &args[0];
    let position = get_position_from_string(position_string);
    if position.is_err() {
        println!("{}", position.err().unwrap().to_string());
        return;
    }
    let position = position.unwrap();
    println!("{}", position.to_string());
}

fn chess_position_from_int_command(args: Vec<String>) {
    let position_int = &args[0];
    let position_int = position_int.parse::<u64>();
    if position_int.is_err() {
        println!("Invalid position int");
        return;
    }
    let position_int = position_int.unwrap();
    let position = get_string_from_position(Position {
        board: position_int,
    });
    if position.is_err() {
        println!("{}", position.err().unwrap().to_string());
        return;
    }
    let position = position.unwrap();
    println!("{}", position);
}

fn chess_position_from_hex_command(args: Vec<String>) {
    let position_hex = &args[0];
    let position_int = u64::from_str_radix(position_hex, 16);
    if position_int.is_err() {
        println!("Invalid position hex");
        return;
    }
    let position_int = position_int.unwrap();
    let position = get_string_from_position(Position {
        board: position_int,
    });
    if position.is_err() {
        println!("{}", position.err().unwrap().to_string());
        return;
    }
    let position = position.unwrap();
    println!("{}", position);
}
