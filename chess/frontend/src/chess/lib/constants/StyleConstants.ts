import { PieceType, PieceColor } from "chess/lib/constants/ChessConstants";

export const draggingOpacity: string = "0.4";
export const nonDraggingOpacity: string = "1.0";

// Maps a piece type to a JSX element which is the piece image
export type PieceMap = { [K in PieceType]: (color: PieceColor, opacity: string) => JSX.Element };

export interface Theme {
    darkMode: boolean;
}