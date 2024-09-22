mod commands;
mod suggestor;
mod validator;

use bunt::println;
use commands::match_command;
use inquire::Text;
use suggestor::command_suggestor;
use validator::command_validator;

pub async fn run_admin_panel() {
    println!("{$red}Starting admin panel{/$}");

    loop {
        let cmd = Text::new("")
            .with_validator(&command_validator)
            .with_autocomplete(&command_suggestor)
            .prompt()
            .unwrap();

        if match_command(cmd) {
            println!("{$red}Exiting admin panel{/$}");
            break;
        }
    }
}
