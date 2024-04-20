import { useSignal } from "@preact/signals-react"
import { defaultPiece, Move, MoveTypes, Piece, PositionRelative } from "chess/lib/constants/BoardConstants"
import { Color, PieceColor, PieceType } from "chess/lib/constants/ChessConstants"
import { SpecialMove } from "chess/lib/constants/CommunicationConstants"
import { Piece_dnd_type } from "chess/lib/constants/DragnDropConstants"
import { BoardContext } from "chess/lib/contexts/BoardContext"
import { getAbsolutePosition, isWhiteSquare } from "chess/lib/utility/BoardOperations"
import "chess/style/pages/multiplayergame/Square.css"
import { useContext, useEffect, useMemo, useRef } from "react"
import { useDrop } from "react-dnd"
import { PieceComponent } from "chess/components/pages/multiplayergame/Piece"
import PromotionSelection from "chess/components/pages/multiplayergame/PromotionSelection"
import DropableMarker from "chess/components/pages/multiplayergame/DropableMarker"

export default function Square(props: {piece: string, positionRelative: PositionRelative}) {
    //context hooks
    const boardContext = useContext(BoardContext);

    //variables
    const squareColor = isWhiteSquare(props.positionRelative[0], props.positionRelative[1]) ? Color.WHITE : Color.BLACK
    const positionAbsolut = useMemo(() => {
        return getAbsolutePosition(props.positionRelative, boardContext.orientation)
    }, [props.positionRelative, boardContext.orientation])
    const moveStore = useRef<[Move, SpecialMove | undefined] | undefined>(undefined);                                       //stores the current Move while promotion selection
    const promotionDialog = useSignal<[boolean, PieceColor]>([false, Color.WHITE]);                                         //shows wheter theres a promotion and for which color
    const currentPiece = useSignal<Piece | undefined>(undefined)                                                            //stores the current piece on the square

    //functions
    const onDrop = (item: Piece) => {
        let move: Move = {
            fromRelative: item.positionRelative,
            toRelative: props.positionRelative,
            fromAbsolute: item.positionAbsolute,
            toAbsolute: positionAbsolut,
            promotionPiece: defaultPiece.type                                                                               //default promotion piece
        }
        if (item.positionAbsolute === positionAbsolut) return;
        let specialMove = boardContext.specialMoves.find((specialMove) => {
            return specialMove.from_absolute === item.positionAbsolute && specialMove.to_absolute === positionAbsolut
        });
        if (specialMove !== undefined && specialMove.special_type === MoveTypes.PROMOTION) {
            moveStore.current = [move, specialMove];
            promotionDialog.value = [true, item.color];
            return;
        }
        boardContext.makeClientMove(move, specialMove);
    }

    const canDrop = (item: Piece) => {
        let possibleMoves = boardContext.validMoves.get(item.positionAbsolute)
        if (possibleMoves === undefined) return false;
        return possibleMoves.includes(positionAbsolut)
    }

    const selectPromotion = (piece: PieceType) => {
        if (moveStore.current === undefined) return;
        if (promotionDialog.value[0] === false) return;
        promotionDialog.value = [false, promotionDialog.value[1]];
        let move = moveStore.current[0]
        move.promotionPiece = piece
        let specialMove = moveStore.current[1]
        boardContext.makeClientMove(move, specialMove);
    }

    //react hooks
    useEffect(() => {
        if (props.piece === "") {
            currentPiece.value = undefined
            return
        }
        let color = props.piece === props.piece.toUpperCase() ? Color.WHITE : Color.BLACK
        let newPiece: Piece = {
            positionRelative: props.positionRelative,
            positionAbsolute: positionAbsolut,
            color: color,
            type: props.piece.toUpperCase() as PieceType
        }
        currentPiece.value = newPiece
    }, [props.piece])

    //drag n drop hooks
    const [{ isOver, isDropableArea, isOverOriginField }, drop] = useDrop({
        accept: Piece_dnd_type,
        drop: (item, _) => onDrop(item as Piece),
        canDrop: (item, _) => canDrop(item as Piece),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isDropableArea: monitor.canDrop(),
            isOverOriginField: monitor.getItem() === null ? false : (monitor.getItem() as Piece).positionRelative[0] === props.positionRelative[0] && (monitor.getItem() as Piece).positionRelative[1] === props.positionRelative[1]
        })
    });

    return (
        <div className={"square_main " + squareColor} ref={drop}>
            {
                promotionDialog.value[0] ?
                    <PromotionSelection color={promotionDialog.value[1]} reportSelection={selectPromotion} />
                :
                    <>
                        <DropableMarker containsPiece={currentPiece.value !== undefined} isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} squareColor={squareColor}>
                            <PieceComponent piece={currentPiece.value} />
                        </DropableMarker>
                        {(isOver && !isOverOriginField) ? <span className="hoveredStyle"></span>: <></>}
                    </>
            }
        </div>
    )
}