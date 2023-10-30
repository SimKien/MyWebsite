export const Piece_names = {
    King: "K",
    Queen: "Q",
    Rook: "R",
    Bishop: "B",
    Knight: "N",
    Pawn: "P"
}
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";

export interface Piece {
    position: Position;
    type: PieceType;
    color: PieceColor;
}

export type Move = {
    from: Position,
    to: Position,
    movedPiece: Piece
};

export const Color = {
    White: "white",
    Black: "black"
}
export type PieceColor = 'white' | 'black';

export const Piece_dnd_type = "Piece"

export type Position = [number, number];
export type PieceMap = { [K in PieceType]: (color: PieceColor, opacity: string) => JSX.Element };
export type PositionInfo = [PieceType | undefined, PieceColor | undefined];

export const draggingOpacity: string = "0.4";
export const nonDraggingOpacity: string = "1.0";
