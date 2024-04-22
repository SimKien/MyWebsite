import { Piece } from "chess/lib/constants/BoardConstants";
import { CSSProperties } from "react";
import { PIECE_MAP } from "chess/components/pages/multiplayergame/Piece";
import { DraggedTag } from "chess/lib/constants/DragnDropConstants";

//Preview for drag and drop on touch devices
export default function DragPreview(props: { piece: Piece, style: CSSProperties }) {
    
    const currentlyDragging = document.getElementsByClassName(DraggedTag)[0]        //get size by referencing currently dragged piece which owns the class DraggedTag alone
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