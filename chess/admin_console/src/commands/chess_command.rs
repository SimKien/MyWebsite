use super::{
    Command, CHESS_BOARD_FORWARD_COMMANDS, CHESS_POSITION_FORWARD_COMMANDS,
    CHESS_TEST_FORWARD_COMMANDS,
};

pub const POSITION_COMMAND: Command = Command {
    name: "position",
    min_args: 1,
    max_args: 1,
    executor: |_| {},
    next_level_commands: CHESS_POSITION_FORWARD_COMMANDS,
    valid: false,
};

pub const BOARD_COMMAND: Command = Command {
    name: "board",
    min_args: 0,
    max_args: 0,
    executor: |_| {},
    next_level_commands: CHESS_BOARD_FORWARD_COMMANDS,
    valid: false,
};

pub const TEST_COMMAND: Command = Command {
    name: "test",
    min_args: 0,
    max_args: 0,
    executor: |_| {},
    next_level_commands: CHESS_TEST_FORWARD_COMMANDS,
    valid: true,
};

pub const CHESS_FORWARD_COMMANDS: &[Command; 3] = &[POSITION_COMMAND, BOARD_COMMAND, TEST_COMMAND];
