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
import { Color, PieceColor } from "chess/lib/constants/ChessConstants";
import { draggingOpacity, nonDraggingOpacity, PieceMap } from "chess/lib/constants/StyleConstants";
import { Piece } from "chess/lib/constants/BoardConstants";
import { useDrag } from "react-dnd";
import { Piece_dnd_type } from "chess/lib/constants/DragnDropConstants";
import "chess/style/pages/multiplayergame/Piece.css"

export const PIECE_MAP: PieceMap = {
    "K": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piece_svg" style={{ opacity: opacity }} src={KingWhiteSVG} alt="King White"></img> : <img className="piece_svg" style={{ opacity: opacity }} src={KingBlackSVG} alt="King Black"></img>,
    "Q": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piece_svg" style={{ opacity: opacity }} src={QueenWhiteSVG} alt="Queen White"></img> : <img className="piece_svg" style={{ opacity: opacity }} src={QueenBlackSVG} alt="Queen Black"></img>,
    "R": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piece_svg" style={{ opacity: opacity }} src={RookWhiteSVG} alt="Rook White"></img> : <img className="piece_svg" style={{ opacity: opacity }} src={RookBlackSVG} alt="Rook Black"></img>,
    "B": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piece_svg" style={{ opacity: opacity }} src={BishopWhiteSVG} alt="Bishop White"></img> : <img className="piece_svg" style={{ opacity: opacity }} src={BishopBlackSVG} alt="Bishop Black"></img>,
    "N": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piece_svg" style={{ opacity: opacity }} src={KnightWhiteSVG} alt="Knight White"></img> : <img className="piece_svg" style={{ opacity: opacity }} src={KnightBlackSVG} alt="Knight Black"></img>,
    "P": (color: PieceColor, opacity: string) => color === Color.WHITE ? <img className="piece_svg" style={{ opacity: opacity }} src={PawnWhiteSVG} alt="Pawn White"></img> : <img className="piece_svg" style={{ opacity: opacity }} src={PawnBlackSVG} alt="Pawn Black"></img>
};

export function PieceComponent(props: { piece: Piece | undefined }) {

    //drag n drop hooks
    const [{ isDragging }, drag] = useDrag({
        type: Piece_dnd_type,
        item: props.piece,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })

    return (
        <>
            {
            props.piece === undefined ?
                <></>
            :
                <div ref={drag} className="piece_main" id={props.piece.positionAbsolute}>
                    {isDragging ? PIECE_MAP[props.piece.type](props.piece.color, draggingOpacity) : PIECE_MAP[props.piece.type](props.piece.color, nonDraggingOpacity)}
                </div>
            }
        </>
    );
}