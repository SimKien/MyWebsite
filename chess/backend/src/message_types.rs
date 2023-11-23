use serde::{Deserialize, Serialize};
use serde_json::{map::Map, Value};

#[derive(Serialize, Deserialize, Debug)]
pub struct SpecialMove {
    pub fromAbsolute: String,
    pub toAbsolute: String,
    pub specialType: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MoveInformation {
    pub messageType: String,
    pub from: String,
    pub to: String,
    pub moveType: String,
    pub promotionPiece: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlayerGameInformation {
    pub id: String,
    pub token: String,
    pub color: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BoardPositionInformation {
    pub boardPosition: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ValidMovesInformation {
    pub validMoves: Map<String, Value>,
    pub specialMoves: Vec<SpecialMove>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlayerInformation {
    pub id: String,
    pub token: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct PlayerQuery {
    pub player_id: String,
    pub token: String,
}
