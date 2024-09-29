pub type Fen = String;
pub type Position = Bitboard;
pub type Piece = char;

#[repr(u8)]
#[derive(Debug, PartialEq, Clone)]
pub enum Color {
    Black = 'b' as u8,
    White = 'w' as u8,
}

impl Color {
    pub fn get_opponent_color(&self) -> Color {
        match self {
            Color::Black => Color::White,
            Color::White => Color::Black,
        }
    }
}

#[derive(Debug)]
pub enum MoveType {
    Normal,
    Capture,
    EnPassant,
    Castle,
    Promotion,
}

#[derive(Debug)]
pub struct ErrorMessage {
    pub message: String,
}

impl ErrorMessage {
    pub fn new(message: String) -> ErrorMessage {
        ErrorMessage { message: message }
    }

    pub fn to_string(&self) -> String {
        return self.message.clone();
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Bitboard {
    pub board: u64,
}

impl Bitboard {
    pub fn new(board: u64) -> Bitboard {
        Bitboard { board: board }
    }
}

#[derive(Debug)]
pub struct Move {
    pub from: Position,
    pub to: Position,
    pub move_type: MoveType,
    pub promotion: Option<Piece>,
}

impl Move {
    pub fn new(
        from: Position,
        to: Position,
        move_type: MoveType,
        promotion: Option<Piece>,
    ) -> Move {
        Move {
            from: from,
            to: to,
            move_type: move_type,
            promotion: promotion,
        }
    }

    //TODO: Implement parsing Move to string like "e4" or "0-0" or "e7e8+" or "e8=Q" or "R1d8"
    //https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
    pub fn to_string(&self) -> String {
        return String::from("");
    }

    //TODO: Implement parsing string to Move like "e4" or "0-0" or "e7e8+" or "e8=Q" or "R1d8"
    //https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
    pub fn from_string(&self, move_string: &String) -> Move {
        return Move::new(
            Bitboard { board: 0 },
            Bitboard { board: 0 },
            MoveType::Normal,
            None,
        );
    }
}
