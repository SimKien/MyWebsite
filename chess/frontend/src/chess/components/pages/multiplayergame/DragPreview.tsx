import { Piece } from "chess/lib/constants/BoardConstants";
import { CSSProperties } from "react";
import { PIECE_MAP } from "chess/components/pages/multiplayergame/Piece";

//Preview for drag and drop on touch devices
export default function DragPreview(props: { piece: Piece, style: CSSProperties }) {

    const currentlyDragging = document.getElementById(props.piece.positionAbsolute)
    const currentlyDraggingStyle = currentlyDragging?.getBoundingClientRect()

    const style = {
        ...props.style,
        width: currentlyDraggingStyle?.width,
        height: currentlyDraggingStyle?.height,
    }

    return (
        <div style={style}>
            {PIECE_MAP[props.piece.type](props.piece.color, "1.0")}
        </div>
    )
}