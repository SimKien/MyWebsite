use chess_engine::is_valid_fen;

use super::Command;

const FEN_VALID_COMMAND: Command = Command {
    name: "fen_valid",
    min_args: 6,
    max_args: 6,
    executor: fen_valid_command,
    next_level_commands: &[],
    valid: true,
};

pub const CHESS_TEST_FORWARD_COMMANDS: &[Command; 1] = &[FEN_VALID_COMMAND];

fn fen_valid_command(args: Vec<String>) {
    let fen = args.join(" ");
    let res = is_valid_fen(&fen);
    println!("{}", res);
}
