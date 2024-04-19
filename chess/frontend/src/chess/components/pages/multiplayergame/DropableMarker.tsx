import { PieceColor } from "chess/lib/constants/ChessConstants";
import "chess/style/pages/multiplayergame/DropableMarker.css"

export default function DropableMarker(props: {containsPiece: boolean, isDropableArea: boolean, isOverOriginField: boolean, squareColor: PieceColor, children: JSX.Element}) {
    return (
        (props.isDropableArea && !props.isOverOriginField) ? 
        (
            props.containsPiece ?
                <div className="dropableMarker_withPiece">
                    <span className={"dropableMarker_withPiece_overlap " + props.squareColor}>
                        {props.children}
                    </span>
                </div>
            :
                <div className="dropableMarker_withoutPiece">
                    {props.children}
                </div>
        )
        :
        <>
            {props.children}
        </>
    )
}