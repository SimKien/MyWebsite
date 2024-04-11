import { PieceColor, PieceType } from "chess/lib/constants/ChessConstants";
import { SpecialMove } from "chess/lib/constants/CommunicationConstants";

export type PositionRelative = [number, number];
export type PositionAbsolute = string;

export const BoardSize = 8;

export const colToLetter = new Map<number, string>([
    [0, "a"],
    [1, "b"],
    [2, "c"],
    [3, "d"],
    [4, "e"],
    [5, "f"],
    [6, "g"],
    [7, "h"]
]);

export const letterToCol = new Map<string, number>([
    ["a", 0],
    ["b", 1],
    ["c", 2],
    ["d", 3],
    ["e", 4],
    ["f", 5],
    ["g", 6],
    ["h", 7]
])

export interface Piece {
    positionRelative: PositionRelative;
    positionAbsolute: PositionAbsolute;
    type: PieceType;
    color: PieceColor;
}

export interface Move {
    fromRelative: PositionRelative;
    toRelative: PositionRelative;
    fromAbsolute: PositionAbsolute;
    toAbsolute: PositionAbsolute;
    promotionPiece: PieceType;
};

//types of moves
export const MoveTypes = {
    CASTLING: "castling",
    EN_PASSANT: "en-passant",
    PROMOTION: "promotion",
    NORMAL: "normal"
}

//public operations on the board-component
export interface BoardOperations {
    flipBoard: () => void;
    makeMove: (move: Move, specialMove: SpecialMove | undefined) => void
}