use std::env;
use anyhow::{Result};

pub fn conflictMarkers() -> Result<()> {
  for (key, value) in env::vars() {
    println!("{} = {}", key, value);
  }

  Ok(())
}
