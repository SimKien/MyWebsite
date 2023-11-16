import { Signal } from "@preact/signals-react";
import { Color, Move, Piece, PieceColor, PieceType, Piece_dnd_type, PositionAbsolute, PositionInfo, PositionRelative, SpecialMove } from "pages/chess/lib/constants/ChessConstants";
import { useMemo, useRef } from "react";
import { getAbsolutePosition, isWhiteSquare } from "pages/chess/lib/BoardOperations";
import { MoveTypes } from "pages/chess/lib/constants/WebsocketConstants";
import { useDrop } from "react-dnd";
import { PieceComponent } from "pages/chess/components/Piece";
import "pages/chess/style/Square.css";

export default function Square(props: {
    rindex: number, cindex: number, makeMove: (move: Move, specialMove: SpecialMove | undefined) => void, piece: string,
    boardOrientation: PieceColor, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>, specialMoves: SpecialMove[],
    size: number
}) {
    const pieceRef = useRef<Piece | undefined>();

    const posRelative = useMemo<PositionRelative>(() => {
        return [props.rindex, props.cindex]
    }, [props.rindex, props.cindex]);

    const posAbsolut = useMemo<PositionAbsolute>(() => {
        return getAbsolutePosition(posRelative, props.size, props.boardOrientation)
    }, [props.boardOrientation])

    const positionInfo = useMemo<PositionInfo>(() => {
        const pieceType = props.piece.toUpperCase() as PieceType || undefined;
        const pieceColor = props.piece === "" ? undefined : (props.piece === props.piece.toUpperCase() ? Color.WHITE : Color.BLACK);
        return [pieceType, pieceColor]
    }, [props.piece])

    const onDrop = (item: Piece) => {
        let move: Move = {
            fromRelative: item.positionRelative,
            toRelative: posRelative,
            fromAbsolute: item.positionAbsolute,
            toAbsolute: posAbsolut
        }
        let specialMove = props.specialMoves.find((specialMove) => {
            return specialMove.fromAbsolute === item.positionAbsolute && specialMove.toAbsolute === posAbsolut
        });
        if (specialMove !== undefined && specialMove.type === MoveTypes.PROMOTION) {
            move.promotionPiece = "Q"               //TODO: add promotion piece selection and set it
        }
        props.makeMove(move, specialMove);
    }

    const canDrop = (item: Piece) => {
        let possibleMoves = props.validMoves.value.get(item.positionAbsolute)
        if (possibleMoves === undefined) return false;
        return possibleMoves.includes(posAbsolut)
    }

    const [{ isOver, isDropableArea, isOverOriginField }, drop] = useDrop({
        accept: Piece_dnd_type,
        drop: (item, _) => onDrop(item as Piece),
        canDrop: (item, _) => canDrop(item as Piece),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isDropableArea: monitor.canDrop(),
            isOverOriginField: monitor.getItem() === null ? false : (monitor.getItem() as Piece).positionRelative[0] === props.rindex && (monitor.getItem() as Piece).positionRelative[1] === props.cindex
        })
    });

    if (positionInfo[0] === undefined || positionInfo[1] === undefined) {
        pieceRef.current = undefined;
        return (
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${isWhiteSquare(props.rindex, props.cindex) ? Color.WHITE : Color.BLACK}`}
                ref={drop}>
                {(isOver && !isOverOriginField) ?
                    <>
                        <DropableMarker isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} containsPiece={false} isWhite={isWhiteSquare(props.rindex, props.cindex)} />
                        <div className="hoveredStyle"></div>
                    </> :
                    <>
                        <DropableMarker isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} containsPiece={false} isWhite={isWhiteSquare(props.rindex, props.cindex)} />
                    </>
                }
            </div>
        );
    } else {
        let newPiece: Piece = {
            positionRelative: posRelative,
            positionAbsolute: posAbsolut,
            type: positionInfo[0],
            color: positionInfo[1]
        }
        pieceRef.current = newPiece;
        return (
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${isWhiteSquare(props.rindex, props.cindex) ? Color.WHITE : Color.BLACK}`}
                ref={drop}>
                {(isOver && !isOverOriginField) ? (
                    <>
                        <DropableMarker isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} containsPiece={true} isWhite={isWhiteSquare(props.rindex, props.cindex)} />
                        <PieceComponent piece={pieceRef.current} />
                        <div className="hoveredStyle"></div>
                    </>
                ) :
                    <>
                        <DropableMarker isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} containsPiece={true} isWhite={isWhiteSquare(props.rindex, props.cindex)} />
                        <PieceComponent piece={pieceRef.current} />
                    </>
                }
            </div>
        );
    }
}

function DropableMarker(props: { isDropableArea: boolean, isOverOriginField: boolean, containsPiece: boolean, isWhite: boolean }) {
    return (
        (props.isDropableArea && !props.isOverOriginField) ? (
            props.containsPiece ?
                <div className="dropableMarkerWithPiece">
                    <span className={`dropableMarkerWithPieceOverlap ${props.isWhite ? Color.WHITE : Color.BLACK}`}></span>
                </div> :
                <div className="dropableMarkerWithoutPiece"></div>
        ) :
            <></>
    );
}