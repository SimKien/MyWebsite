import { SpecialMove } from "chess/lib/constants/CommunicationConstants";

export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type PieceColor = 'white' | 'black';

export type PositionRelative = [number, number];
export type PositionAbsolute = string;
export type PieceMap = { [K in PieceType]: (color: PieceColor, opacity: string) => JSX.Element };
export type PositionInfo = [PieceType | undefined, PieceColor | undefined];

//public operations on the board-component
export interface BoardOperations {
    flipBoard: () => void;
    makeMove: (move: Move, specialMove: SpecialMove | undefined) => void
}

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

export const Piece_names = {
    King: "K",
    Queen: "Q",
    Rook: "R",
    Bishop: "B",
    Knight: "N",
    Pawn: "P"
}

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

export const Color: { WHITE: PieceColor, BLACK: PieceColor } = {
    WHITE: "white",
    BLACK: "black"
}

export const draggingOpacity: string = "0.4";
export const nonDraggingOpacity: string = "1.0";

export const Piece_dnd_type = "Piece"

export const BoardSize = 8;