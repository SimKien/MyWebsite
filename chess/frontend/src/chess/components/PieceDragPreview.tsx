import { Piece } from "chess/lib/constants/ChessConstants";
import { CSSProperties } from "react";
import { PIECE_MAP } from "./Piece";
import "chess/style/Square.css"

export default function PieceDragPreview(props: { piece: Piece, style: CSSProperties }) {
    return (
        <div style={props.style} className="square">
            {PIECE_MAP[props.piece.type](props.piece.color, "1.0")}
        </div>
    )
}