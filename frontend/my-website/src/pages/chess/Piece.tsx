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
import "pages/chess/Piece.css"

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
    K: (color: PieceColor) => color === 'white' ? <img className="piecesvg" src={KingWhiteSVG} alt="King White"></img> : <img className="piecesvg" src={KingBlackSVG} alt="King Black"></img>,
    Q: (color: PieceColor) => color === 'white' ? <img className="piecesvg" src={QueenWhiteSVG} alt="Queen White"></img> : <img className="piecesvg" src={QueenBlackSVG} alt="Queen Black"></img>,
    R: (color: PieceColor) => color === 'white' ? <img className="piecesvg" src={RookWhiteSVG} alt="Rook White"></img> : <img className="piecesvg" src={RookBlackSVG} alt="Rook Black"></img>,
    B: (color: PieceColor) => color === 'white' ? <img className="piecesvg" src={BishopWhiteSVG} alt="Bishop White"></img> : <img className="piecesvg" src={BishopBlackSVG} alt="Bishop Black"></img>,
    N: (color: PieceColor) => color === 'white' ? <img className="piecesvg" src={KnightWhiteSVG} alt="Knight White"></img> :<img className="piecesvg" src={KnightBlackSVG} alt="Knight Black"></img>,
    P: (color: PieceColor) => color === 'white' ? <img className="piecesvg" src={PawnWhiteSVG} alt="Pawn White"></img> : <img className="piecesvg" src={PawnBlackSVG} alt="Pawn Black"></img>
};

export function PieceComponent(props: {piece: Piece | undefined}) {
    if (props.piece === undefined) {
        return <div className="piececontainer"></div>;
    } else {
        return (
            <div className="piececontainer">
                {PIECE_MAP[props.piece.type](props.piece.color)}
            </div>
        );
    }
}
