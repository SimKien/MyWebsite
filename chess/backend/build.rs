use std::process::Command;
use std::{env, fs};

//Build frontend if changed

fn main() {
    let cmd = if cfg!(windows) { "npm.cmd" } else { "npm" };

    //Set Specta TYPES used to generate typescript types
    {
        let types = comlib::TYPES.lock().unwrap().clone();
        let mut lock = specta::export::TYPES.lock().unwrap();

        *lock = types;
    }
    const BINDINGS: &str = "../frontend/src/chess/lib/constants/CommunicationConstants.ts";
    const TEMP_BINDINGS: &str = "../target/bindings.ts.tmp";
    specta::export::ts(TEMP_BINDINGS).unwrap();
    let old = fs::read_to_string(BINDINGS).unwrap_or_default();
    let new = fs::read_to_string(TEMP_BINDINGS).unwrap();
    // Only update bindings if they changed to avoid triggering a recompile of the frontend
    if old != new {
        println!("cargo:warning=Updating bindings");
        fs::write(BINDINGS, new).unwrap();
    }

    // Get the project directory
    let project_dir = env::current_dir().unwrap();

    // Build the path to the `liberica` directory
    let frontend_dir = project_dir.parent().unwrap().join("frontend");

    for path in ["package.json", "src", "tsconfig.json", "index.html"] {
        println!(
            "cargo:rerun-if-changed={}/{}",
            frontend_dir.to_string_lossy(),
            path
        );
    }
    println!("cargo:warning=Building frontend");

    // Change into the `liberica` directory
    env::set_current_dir(frontend_dir).unwrap();

    // Run `npm install`
    let npm_install = Command::new(cmd)
        .arg("install")
        .output()
        .expect("Failed to run `npm install`");

    // Check for errors in `npm install`
    if !npm_install.status.success() {
        panic!(
            "`npm install` failed: {}",
            String::from_utf8_lossy(&npm_install.stderr)
        );
    }

    // Run `npm run build`
    let npm_build = Command::new(cmd)
        .arg("run")
        .arg("build")
        .output()
        .expect("Failed to run `npm run build`");

    // Check for errors in `npm run build`
    if !npm_build.status.success() {
        panic!(
            "`npm run build` failed: {}",
            String::from_utf8_lossy(&npm_build.stderr)
        );
    }

    // Optionally, change back to the original directory
    env::set_current_dir(project_dir).unwrap();
}
