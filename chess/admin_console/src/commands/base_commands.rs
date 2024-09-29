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

const CHESS_COMMAND: Command = Command {
    name: "chess",
    min_args: 0,
    max_args: 0,
    executor: |_| {},
    next_level_commands: super::chess_command::CHESS_FORWARD_COMMANDS,
    valid: false,
};

const EXIT_COMMAND: Command = Command {
    name: "exit",
    min_args: 0,
    max_args: 0,
    executor: |_| {},
    next_level_commands: &[],
    valid: true,
};

pub const BASE_COMMANDS: &[Command<'static>; 3] = &[HELLO_COMMAND, CHESS_COMMAND, EXIT_COMMAND];

/*
    Finds and executes the command that matches the input string.
*/
pub fn execute_command(args: String) -> bool {
    let args: Vec<String> = args.split(" ").map(|s| s.to_string()).collect();

    let (command, command_arguments, command_addons) = find_command(&args);

    if command.name == EXIT_COMMAND.name {
        return true;
    }

    let storage = execute_addons_pre(&command_addons);

    (command.executor)(command_arguments);

    execute_addons_post(storage);

    return false;
}

fn execute_addons_pre(command_addons: &Vec<String>) -> Vec<(String, Vec<String>)> {
    let mut storage = Vec::new();
    for command_addon in super::COMMAND_ADDONS
        .iter()
        .filter(|p| command_addons.contains(&p.name.to_string()))
    {
        let mut addon_storage = Vec::new();
        (command_addon.pre_executor)(&mut addon_storage);
        storage.push((command_addon.name.to_string(), addon_storage));
    }
    return storage;
}

fn execute_addons_post(storage: Vec<(String, Vec<String>)>) {
    for (addon_command, addon_storage) in storage {
        let command = super::COMMAND_ADDONS
            .iter()
            .find(|p| p.name == addon_command)
            .unwrap();
        ((command.post_executor)(&addon_storage));
    }
}

fn find_command(args: &Vec<String>) -> (&'static Command<'static>, Vec<String>, Vec<String>) {
    let mut current_command = BASE_COMMANDS.iter().find(|p| p.name == args[0]).unwrap();
    let mut index = 1;

    if args.len() == 1 {
        return (current_command, Vec::new(), Vec::new());
    }

    let mut command_arguments = args[1..].to_vec();
    command_arguments.reverse();

    while let Some(command) = current_command
        .next_level_commands
        .iter()
        .find(|p| p.name == args[index])
    {
        index += 1;

        current_command = command;

        command_arguments.pop();

        if index >= args.len() {
            break;
        }
    }

    let mut command_addons = Vec::new();
    for part in &command_arguments {
        if super::COMMAND_ADDONS.iter().any(|p| p.name == part) {
            command_addons.push(part.clone());
        } else {
            break;
        }
    }

    command_arguments.reverse();
    command_arguments.truncate(command_arguments.len() - command_addons.len());

    return (current_command, command_arguments, command_addons);
}
