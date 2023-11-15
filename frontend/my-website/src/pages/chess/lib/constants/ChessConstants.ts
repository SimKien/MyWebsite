export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type PieceColor = 'white' | 'black';

export type PositionRelative = [number, number];
export type PositionAbsolute = string;
export type PieceMap = { [K in PieceType]: (color: PieceColor, opacity: string) => JSX.Element };
export type PositionInfo = [PieceType | undefined, PieceColor | undefined];

//public operations on the board-component
export interface BoardOperations {
    flipBoard: () => void;
    makeMove: (move: Move, specialMove: SpecialMove) => void
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
    promotionPiece?: PieceType;
};

export type SpecialMove = {
    fromAbsolute: PositionAbsolute,
    toAbsolute: PositionAbsolute,
    type: string
}

export const Piece_names = {
    King: "K",
    Queen: "Q",
    Rook: "R",
    Bishop: "B",
    Knight: "N",
    Pawn: "P"
}

export const Piece_promotions = {
    Queen: "Q",
    Rook: "R",
    Bishop: "B",
    Knight: "N"
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

export const Color: { WHITE: PieceColor, BLACK: PieceColor } = {
    WHITE: "white",
    BLACK: "black"
}

export const draggingOpacity: string = "0.4";
export const nonDraggingOpacity: string = "1.0";

export const Piece_dnd_type = "Piece"

export const BoardSize = 8;