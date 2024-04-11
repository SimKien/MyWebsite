/*
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
import "chess/style/Piece.css"
import { useDrag } from "react-dnd";
import { Color, Piece_dnd_type, PieceColor, PieceMap, Piece, draggingOpacity, nonDraggingOpacity } from "chess/lib/constants/ChessConstants";

export const PIECE_MAP: PieceMap = {
    "K": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piecesvg" style={{ opacity: opacity }} src={KingWhiteSVG} alt="King White"></img> : <img className="piecesvg" style={{ opacity: opacity }} src={KingBlackSVG} alt="King Black"></img>,
    "Q": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piecesvg" style={{ opacity: opacity }} src={QueenWhiteSVG} alt="Queen White"></img> : <img className="piecesvg" style={{ opacity: opacity }} src={QueenBlackSVG} alt="Queen Black"></img>,
    "R": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piecesvg" style={{ opacity: opacity }} src={RookWhiteSVG} alt="Rook White"></img> : <img className="piecesvg" style={{ opacity: opacity }} src={RookBlackSVG} alt="Rook Black"></img>,
    "B": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piecesvg" style={{ opacity: opacity }} src={BishopWhiteSVG} alt="Bishop White"></img> : <img className="piecesvg" style={{ opacity: opacity }} src={BishopBlackSVG} alt="Bishop Black"></img>,
    "N": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piecesvg" style={{ opacity: opacity }} src={KnightWhiteSVG} alt="Knight White"></img> : <img className="piecesvg" style={{ opacity: opacity }} src={KnightBlackSVG} alt="Knight Black"></img>,
    "P": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piecesvg" style={{ opacity: opacity }} src={PawnWhiteSVG} alt="Pawn White"></img> : <img className="piecesvg" style={{ opacity: opacity }} src={PawnBlackSVG} alt="Pawn Black"></img>
};

export function PieceComponent(props: { piece: Piece }) {
    const [{ isDragging }, drag] = useDrag({
        type: Piece_dnd_type,
        item: props.piece,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })

    return (
        <div ref={drag} className="piececontainer">
            {isDragging ? PIECE_MAP[props.piece.type](props.piece.color, draggingOpacity) : PIECE_MAP[props.piece.type](props.piece.color, nonDraggingOpacity)}
        </div>
    );
}
*/