use crate::types::{Color, Position};

pub type PossibleMove = (i8, i8);

pub const PIECE_TYPES: &[char; 6] = &['K', 'Q', 'R', 'B', 'N', 'P'];
pub const PIECES: &[char; 12] = &['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'];

pub const PAWN_MOVES: fn(&Color) -> [PossibleMove; 3] = |color: &Color| {
    if color.clone() == Color::White {
        [(1, 0), (1, -1), (1, 1)]
    } else {
        [(-1, 0), (-1, -1), (-1, 1)]
    }
};
pub const BISHOP_MOVES: [PossibleMove; 4] = [(1, 1), (1, -1), (-1, 1), (-1, -1)];
pub const ROOK_MOVES: [PossibleMove; 4] = [(1, 0), (0, 1), (-1, 0), (0, -1)];
pub const KNIGHT_MOVES: [PossibleMove; 8] = [
    (1, 2),
    (2, 1),
    (2, -1),
    (1, -2),
    (-1, -2),
    (-2, -1),
    (-2, 1),
    (-1, 2),
];
pub const KING_MOVES: [PossibleMove; 8] = [
    (1, 0),
    (1, 1),
    (0, 1),
    (-1, 1),
    (-1, 0),
    (-1, -1),
    (0, -1),
    (1, -1),
];
pub const QUEEN_MOVES: [PossibleMove; 8] = [
    (1, 0),
    (1, 1),
    (0, 1),
    (-1, 1),
    (-1, 0),
    (-1, -1),
    (0, -1),
    (1, -1),
];

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum PieceType {
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
    None,
}

impl PieceType {
    pub fn from_char(c: char) -> PieceType {
        match c {
            'K' => PieceType::King,
            'Q' => PieceType::Queen,
            'R' => PieceType::Rook,
            'B' => PieceType::Bishop,
            'N' => PieceType::Knight,
            'P' => PieceType::Pawn,
            _ => PieceType::None,
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            PieceType::King => "K",
            PieceType::Queen => "Q",
            PieceType::Rook => "R",
            PieceType::Bishop => "B",
            PieceType::Knight => "N",
            PieceType::Pawn => "P",
            PieceType::None => "-",
        }
    }

    pub fn to_piece(&self, color: &Color) -> char {
        if color.clone() == Color::Black {
            return self.as_str().to_ascii_lowercase().chars().next().unwrap();
        }
        return self.as_str().chars().next().unwrap();
    }
}

#[repr(u8)]
#[derive(Debug, Clone)]
pub enum CastleType {
    WhiteKingSide = 'K' as u8,
    WhiteQueenSide = 'Q' as u8,
    BlackKingSide = 'k' as u8,
    BlackQueenSide = 'q' as u8,
}

impl CastleType {
    pub fn get_move(&self) -> PossibleMove {
        match self {
            CastleType::WhiteKingSide => (0, 2),
            CastleType::WhiteQueenSide => (0, -2),
            CastleType::BlackKingSide => (0, 2),
            CastleType::BlackQueenSide => (0, -2),
        }
    }

    pub fn get_rook_position(&self) -> Position {
        match self {
            CastleType::WhiteKingSide => Position::new(0x0000000000000001),
            CastleType::WhiteQueenSide => Position::new(0x0000000000000080),
            CastleType::BlackKingSide => Position::new(0x0100000000000000),
            CastleType::BlackQueenSide => Position::new(0x8000000000000000),
        }
    }

    pub fn get_king_position(&self) -> Position {
        match self {
            CastleType::WhiteKingSide => Position::new(0x0000000000000008),
            CastleType::WhiteQueenSide => Position::new(0x0000000000000008),
            CastleType::BlackKingSide => Position::new(0x0800000000000000),
            CastleType::BlackQueenSide => Position::new(0x0800000000000000),
        }
    }

    pub fn get_color(&self) -> Color {
        match self {
            CastleType::WhiteKingSide => Color::White,
            CastleType::WhiteQueenSide => Color::White,
            CastleType::BlackKingSide => Color::Black,
            CastleType::BlackQueenSide => Color::Black,
        }
    }
}

#[derive(Debug, Clone)]
pub struct GamePiece {
    pub piece_type: PieceType,
    pub color: Color,
    pub position: Position,
}

impl GamePiece {
    pub fn new(piece_type: PieceType, color: Color, position: Position) -> GamePiece {
        GamePiece {
            piece_type: piece_type,
            color: color,
            position: position,
        }
    }

    pub fn to_piece(&self) -> char {
        return self.piece_type.to_piece(&self.color);
    }
}
