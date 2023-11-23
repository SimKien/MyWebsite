#![allow(non_snake_case)]
use std::{
    collections::{BTreeSet, HashMap},
    sync::Mutex,
};

use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use specta::{ExportError, Type, TypeDefs};

//Get reference to TYPES of specta which is used to generate typescript types
pub static TYPES: &Lazy<Mutex<(TypeDefs, BTreeSet<ExportError>)>> = &specta::export::TYPES;

#[derive(Type, Serialize, Deserialize, Debug)]
pub struct SpecialMove {
    pub from_absolute: String,
    pub to_absolute: String,
    pub special_type: String,
}

//Communication structs to Frontend
#[derive(Type, Serialize, Deserialize, Debug)]
pub struct WebsocketMessage {
    pub message_type: String,
    pub from: String,
    pub to: String,
    pub move_type: String,
    pub promotion_piece: String,
}

#[derive(Type, Serialize, Deserialize, Debug)]
pub struct PlayerGameInformation {
    pub id: String,
    pub token: String,
    pub color: String,
}

#[derive(Type, Serialize, Deserialize, Debug)]
pub struct BoardPositionInformation {
    pub board_position: String,
}

#[derive(Type, Serialize, Deserialize, Debug)]
pub struct ValidMovesInformation {
    pub valid_moves: HashMap<String, Vec<String>>,
    pub special_moves: Vec<SpecialMove>,
}

#[derive(Type, Serialize, Deserialize, Debug)]
pub struct PlayerInformation {
    pub id: String,
    pub token: String,
}
