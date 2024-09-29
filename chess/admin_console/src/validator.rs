use inquire::{
    validator::{ErrorMessage, Validation},
    CustomUserError,
};

use crate::commands::{Command, BASE_COMMANDS, COMMAND_ADDONS};

/*
    Entry point for the recursive command validation.
*/
pub fn command_validator(input: &str) -> Result<Validation, CustomUserError> {
    let input = input.to_lowercase();
    let cmd_parts: Vec<&str> = input.split(" ").collect();

    if cmd_parts.is_empty() {
        return Ok(Validation::Invalid(ErrorMessage::Custom(
            "No command entered".to_string(),
        )));
    }

    let mut cmd_parts_updated = cmd_parts.clone();
    for part in cmd_parts.iter().rev() {
        if COMMAND_ADDONS.iter().any(|a| a.name == *part) {
            cmd_parts_updated.pop();
        } else {
            break;
        }
    }

    recursive_validator(cmd_parts_updated, 0, BASE_COMMANDS, None)
}

/*
    Recursive validator for the commands.
*/
fn recursive_validator(
    cmd_parts: Vec<&str>,
    depth: usize,
    current_commands: &[Command],
    last_command: Option<&Command>,
) -> Result<Validation, CustomUserError> {
    let current_part = cmd_parts.get(depth).unwrap();

    let cmd_finished = current_commands
        .iter()
        .find(|p| p.name.to_lowercase() == current_part.to_string());

    if cmd_finished.is_none() {
        //If the last command was valid but the current is no command, then the last command is the regarded command and must be cheked
        if let Some(last_command) = last_command {
            if !last_command.valid {
                return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                    "Command '{}' alone is not valid",
                    last_command.name
                ))));
            }
            if (cmd_parts.len() - depth) < last_command.min_args {
                return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                    "Command '{}' requires at least {} arguments",
                    last_command.name, last_command.min_args
                ))));
            } else if (cmd_parts.len() - depth) > last_command.max_args {
                return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                    "Command '{}' requires at most {} arguments",
                    last_command.name, last_command.max_args
                ))));
            }
            return Ok(Validation::Valid);
        }

        return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
            "Command '{}' not found",
            current_part
        ))));
    }

    let current_cmd = cmd_finished.unwrap();

    //If the current command has no next level commands, then it is the final command and we can check the arguments
    if current_cmd.next_level_commands.is_empty() {
        if !current_cmd.valid {
            return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                "Command '{}' alone is not valid",
                current_cmd.name
            ))));
        }
        if (cmd_parts.len() - depth - 1) < current_cmd.min_args {
            return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                "Command '{}' requires at least {} arguments",
                current_cmd.name, current_cmd.min_args
            ))));
        } else if (cmd_parts.len() - depth - 1) > current_cmd.max_args {
            return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                "Command '{}' requires at most {} arguments",
                current_cmd.name, current_cmd.max_args
            ))));
        }
        return Ok(Validation::Valid);
    }

    if cmd_parts.len() <= depth + 1 {
        if current_cmd.valid && current_cmd.min_args == 0 {
            return Ok(Validation::Valid);
        } else if current_cmd.min_args > 0 {
            return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                "Command '{}' requires at least {} arguments",
                current_cmd.name, current_cmd.min_args
            ))));
        } else {
            return Ok(Validation::Invalid(ErrorMessage::Custom(format!(
                "Command '{}' alone is not valid",
                current_cmd.name
            ))));
        }
    }

    return recursive_validator(
        cmd_parts.clone(),
        depth + 1,
        current_cmd.next_level_commands,
        Some(current_cmd),
    );
}
