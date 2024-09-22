use super::HELLO_FORWARD_COMMANDS;

#[derive(Debug, Clone)]
pub struct Command<'a> {
    pub name: &'a str,
    pub min_args: usize,
    pub max_args: usize,
    pub executor: fn(Vec<String>) -> (),
    pub next_level_commands: &'a [Command<'a>],
    pub valid: bool,
}

const HELLO_COMMAND: Command = Command {
    name: "hello",
    min_args: 0,
    max_args: 0,
    executor: super::hello_command::hello_command,
    next_level_commands: HELLO_FORWARD_COMMANDS,
    valid: true,
};

const EXIT_COMMAND: Command = Command {
    name: "exit",
    min_args: 0,
    max_args: 0,
    executor: |_| {},
    next_level_commands: &[],
    valid: true,
};

pub const BASE_COMMANDS: &[Command<'static>; 2] = &[HELLO_COMMAND, EXIT_COMMAND];

/*
    Finds and executes the command that matches the input string.
*/
pub fn match_command(args: String) -> bool {
    let mut args: Vec<String> = args.split(" ").map(|s| s.to_string()).collect();

    let mut current_command = BASE_COMMANDS.iter().find(|p| p.name == args[0]).unwrap();
    let mut index = 1;

    if args.len() == 1 {
        (current_command.executor)(Vec::new());

        if current_command.name == "exit" {
            return true;
        }

        return false;
    }

    while let Some(command) = current_command
        .next_level_commands
        .iter()
        .find(|p| p.name == args[index])
    {
        index += 1;

        current_command = command;

        if index >= args.len() {
            break;
        }
    }

    args.reverse();
    args.truncate(args.len() - index);
    args.reverse();
    (current_command.executor)(args);

    if current_command.name == "exit" {
        return true;
    }

    return false;
}
