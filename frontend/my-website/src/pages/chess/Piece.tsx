import KingWhiteSVG from "assets/kingwhite.svg?react";
import KingBlackSVG from "assets/kingblack.svg?react";
import QueenWhiteSVG from "assets/queenwhite.svg?react";
import QueenBlackSVG from "assets/queenblack.svg?react";
import RookWhiteSVG from "assets/rookwhite.svg?react";
import RookBlackSVG from "assets/rookblack.svg?react";
import KnightWhiteSVG from "assets/knightwhite.svg?react";
import KnightBlackSVG from "assets/knightblack.svg?react";
import BishopWhiteSVG from "assets/bishopwhite.svg?react";
import BishopBlackSVG from "assets/bishopblack.svg?react";
import PawnWhiteSVG from "assets/pawnwhite.svg?react";
import PawnBlackSVG from "assets/pawnblack.svg?react";

export type Position = [number, number];
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type PieceColor = 'white' | 'black';
export type PieceMap = {[K in PieceType]: (color: PieceColor) => JSX.Element};
export type PositionInfo = [PieceType | undefined, PieceColor | undefined];


export interface Piece {
    position: Position;
    type: PieceType;
    color: PieceColor;
}

export const PIECE_MAP: PieceMap= {
    K: (color: PieceColor) => color === 'white' ? <KingWhiteSVG /> : <KingBlackSVG />,
    Q: (color: PieceColor) => color === 'white' ? <QueenWhiteSVG /> : <QueenBlackSVG />,
    R: (color: PieceColor) => color === 'white' ? <RookWhiteSVG /> : <RookBlackSVG />,
    B: (color: PieceColor) => color === 'white' ? <BishopWhiteSVG /> : <BishopBlackSVG />,
    N: (color: PieceColor) => color === 'white' ? <KnightWhiteSVG /> : <KnightBlackSVG />,
    P: (color: PieceColor) => color === 'white' ? <PawnWhiteSVG /> : <PawnBlackSVG />
};

export function PieceComponent(props: {piece: Piece}) {

    return PIECE_MAP[props.piece.type](props.piece.color);
}
