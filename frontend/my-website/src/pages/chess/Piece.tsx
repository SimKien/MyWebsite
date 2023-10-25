import KingWhiteSVG from "assets/kingwhite.svg";
import KingBlackSVG from "assets/kingblack.svg";
import QueenWhiteSVG from "assets/queenwhite.svg";
import QueenBlackSVG from "assets/queenblack.svg";
import RookWhiteSVG from "assets/rookwhite.svg";
import RookBlackSVG from "assets/rookblack.svg";
import KnightWhiteSVG from "assets/knightwhite.svg";
import KnightBlackSVG from "assets/knightblack.svg";
import BishopWhiteSVG from "assets/bishopwhite.svg";
import BishopBlackSVG from "assets/bishopblack.svg";
import PawnWhiteSVG from "assets/pawnwhite.svg";
import PawnBlackSVG from "assets/pawnblack.svg";

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
    K: (color: PieceColor) => color === 'white' ? <img src={KingWhiteSVG} alt="King White"></img> : <img src={KingBlackSVG} alt="King Black"></img>,
    Q: (color: PieceColor) => color === 'white' ? <img src={QueenWhiteSVG} alt="Queen White"></img> : <img src={QueenBlackSVG} alt="Queen Black"></img>,
    R: (color: PieceColor) => color === 'white' ? <img src={RookWhiteSVG} alt="Rook White"></img> : <img src={RookBlackSVG} alt="Rook Black"></img>,
    B: (color: PieceColor) => color === 'white' ? <img src={BishopWhiteSVG} alt="Bishop White"></img> : <img src={BishopBlackSVG} alt="Bishop Black"></img>,
    N: (color: PieceColor) => color === 'white' ? <img src={KnightWhiteSVG} alt="Knight White"></img> :<img src={KnightBlackSVG} alt="Knight Black"></img>,
    P: (color: PieceColor) => color === 'white' ? <img src={PawnWhiteSVG} alt="Pawn White"></img> : <img src={PawnBlackSVG} alt="Pawn Black"></img>
};

export function PieceComponent(props: {piece: Piece | undefined}) {
    if (props.piece === undefined) {
        return <></>;
    } else {
        return PIECE_MAP[props.piece.type](props.piece.color);
    }
}
