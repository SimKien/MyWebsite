use inquire::CustomUserError;

use crate::commands::{Command, BASE_COMMANDS};

pub const NUM_SUGGESTIONS: usize = 5;

/*
    Entry point for the recursive suggestion of the command.
*/
pub fn command_suggestor(input: &str) -> Result<Vec<String>, CustomUserError> {
    let input = input.to_lowercase();
    let cmd_parts: Vec<&str> = input.split(" ").collect();

    recursive_suggestor(cmd_parts, 0, BASE_COMMANDS)
}

/*
    Recursive suggestor for the commands.
*/
fn recursive_suggestor(
    cmd_parts: Vec<&str>,
    depth: usize,
    current_commands: &[Command],
) -> Result<Vec<String>, CustomUserError> {
    if cmd_parts.len() <= depth || current_commands.is_empty() {
        return Ok(vec![]); //no more suggestions needed
    }

    //if the command consists of only spaces or 2 spaces in a row, return empty suggestions
    if cmd_parts.iter().take(2).all(|p| p.to_string().is_empty()) {
        return Ok(vec![]);
    }

    let current_part = cmd_parts.get(depth).unwrap();

    let cmd_finished = current_commands
        .iter()
        .find(|p| p.name.to_lowercase() == current_part.to_string());

    if let Some(current_cmd) = cmd_finished {
        //recursivly call the suggestor to get the next level of suggestions while staying in the same command

        let recursive_result = recursive_suggestor(
            cmd_parts.clone(),
            depth + 1,
            current_cmd.next_level_commands,
        );

        if let Ok(mut suggestions) = recursive_result {
            let substring_commands: Vec<String> = if depth == cmd_parts.len() - 1 {
                //if one command on the last level is substring of another command, return this command too as suggestion
                current_commands
                    .iter()
                    .filter(|p| {
                        p.name.starts_with(current_part)
                            && p.name.to_string() != current_part.to_string()
                    })
                    .take(NUM_SUGGESTIONS - 1)
                    .map(|s| s.name.to_string())
                    .collect()
            } else {
                vec![]
            };

            if suggestions.is_empty() {
                suggestions.push(current_part.to_string());
                suggestions.extend(substring_commands);
                return Ok(suggestions);
            }

            return Ok(suggestions
                .iter()
                .map(|s| format!("{} {}", current_part, s))
                .collect());
        }
        return recursive_result;
    }

    Ok(current_commands
        .iter()
        .filter(|p| p.name.to_lowercase().contains(current_part))
        .map(|s| s.name.to_string())
        .take(NUM_SUGGESTIONS)
        .collect())
}
