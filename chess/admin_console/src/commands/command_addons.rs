#[derive(Debug)]
pub struct CommandAddon<'a> {
    pub name: &'a str,
    pub pre_executor: fn(&mut Vec<String>) -> (),
    pub post_executor: fn(&Vec<String>) -> (),
}

const TIME_ADDON: CommandAddon = CommandAddon {
    name: "--time",
    pre_executor: time_pre_executor,
    post_executor: time_post_executor,
};

pub const COMMAND_ADDONS: &[CommandAddon<'static>; 1] = &[TIME_ADDON];

fn time_pre_executor(storage: &mut Vec<String>) {
    let time = chrono::Utc::now();
    storage.push(time.to_rfc3339());
}

fn time_post_executor(storage: &Vec<String>) {
    let start_time = chrono::DateTime::parse_from_rfc3339(&storage[0]).unwrap();
    let time = chrono::Utc::now();
    let diff = time.signed_duration_since(start_time);
    let num_millis = diff.num_milliseconds() % 1_000;
    let num_seconds = diff.num_seconds() % 60;
    let num_minutes = (diff.num_seconds() / 60) % 60;
    let num_hours = diff.num_seconds() / 3600;
    let result = if diff.num_nanoseconds().is_some() {
        let num_nano = diff.num_nanoseconds().unwrap() % 1_000;
        let num_micro = diff.num_microseconds().unwrap() % 1_000;
        format!(
            "{}h {}min {}s {}ms {}us {}ns",
            num_hours, num_minutes, num_seconds, num_millis, num_micro, num_nano
        )
    } else if diff.num_microseconds().is_some() {
        let num_micro = diff.num_microseconds().unwrap() % 1_000;
        format!(
            "{}h {}min {}s {}ms {}us",
            num_hours, num_minutes, num_seconds, num_millis, num_micro
        )
    } else {
        format!(
            "{}h {}min {}s {}ms",
            num_hours, num_minutes, num_seconds, num_millis
        )
    };
    println!("Time taken: {}", result);
}
