use bunt::println;
use chess_engine::hello_chess;

use super::Command;

const SAY_COMMAND: Command = Command {
    name: "say",
    min_args: 1,
    max_args: 10,
    executor: hello_say_command,
    next_level_commands: &[],
    valid: true,
};

const GREET_COMMAND: Command = Command {
    name: "greet",
    min_args: 1,
    max_args: 10,
    executor: hello_greet_command,
    next_level_commands: &[],
    valid: true,
};

const HELLO_CHESS_COMMAND: Command = Command {
    name: "chess",
    min_args: 0,
    max_args: 0,
    executor: hello_chess_command,
    next_level_commands: &[],
    valid: true,
};

pub const HELLO_FORWARD_COMMANDS: &[Command; 3] =
    &[SAY_COMMAND, GREET_COMMAND, HELLO_CHESS_COMMAND];

pub fn hello_command(_: Vec<String>) {
    println!("{$cyan+bold}Hello world!{/$}");
}

pub fn hello_greet_command(args: Vec<String>) {
    let args = args.join(" ");
    println!("{$cyan+bold}Hi {}!{/$}", args);
}

pub fn hello_say_command(args: Vec<String>) {
    let args = args.join(" ");
    println!("{$cyan+bold}{}{/$}", args);
}

pub fn hello_chess_command(_: Vec<String>) {
    hello_chess();
}
