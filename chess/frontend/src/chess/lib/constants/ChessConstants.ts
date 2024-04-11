export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type PieceColor = 'white' | 'black';

export type PositionInfo = [PieceType | undefined, PieceColor | undefined];

export const Piece_names = {
    King: "K",
    Queen: "Q",
    Rook: "R",
    Bishop: "B",
    Knight: "N",
    Pawn: "P"
}

export const Color: { WHITE: PieceColor, BLACK: PieceColor } = {
    WHITE: "white",
    BLACK: "black"
}