use anyhow::{anyhow, Context, Error, Result};

mod action;

#[derive(Debug)]
enum Command {
  Wait,
  ConflictMarkers
}

impl std::str::FromStr for Command {
  type Err = Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    let cmd = match s {
      "wait" => Command::Wait,
      "conflict-markers" => Command::ConflictMarkers,
      _ => return Err(anyhow!("Invalid command: {}", s)),
    };

    Ok(cmd)
  }
}

fn main() -> Result<()> {
  let cmd: Command = std::env::args()
    .nth(1)
    .context("Must provide a command")?
    .parse()?;

  let result = match cmd {
    Command::Wait => action::wait(),
    Command::ConflictMarkers => action::conflictMarkers(),
  };

  if let Err(err) = result {
    eprintln!("{:?}", err);

    std::process::exit(1);
  }

  Ok(())
}
