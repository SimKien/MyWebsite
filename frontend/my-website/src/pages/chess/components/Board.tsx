import { useEffect, useMemo, useRef } from "react";
import "pages/chess/style/Board.css";
import { PieceComponent } from "pages/chess/components/Piece";
import { Color, PieceColor, PieceType, Piece_dnd_type, Piece, Move, BoardSize, BoardOperations, PositionAbsolute, colToLetter, PositionInfo, SpecialMove } from "pages/chess/lib/constants/ChessConstants"
import { loadPosition, movePiece, turnBoard, isWhiteSquare } from "pages/chess/lib/BoardOperations";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Signal, signal } from "@preact/signals-react";
import { Player } from "pages/chess/lib/Game";
import { MoveTypes } from "pages/chess/lib/constants/WebsocketConstants";

const board = signal<string[][]>((new Array(BoardSize).fill(new Array(BoardSize).fill(""))));

export default function Board(props: {
    boardPosition: Signal<string>, reportMove: (move: Move) => void, player: Signal<Player>,
    boardOperations: BoardOperations, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>,
    specialMoves: Signal<SpecialMove[]>
}) {
    const boardOrientation = useRef<PieceColor>(Color.WHITE as PieceColor);

    useEffect(() => {
        props.boardOperations.flipBoard = flipBoard;
        props.boardOperations.makeMove = makeServerMove;
    }, []);

    useEffect(() => {
        if (boardOrientation.current === Color.BLACK) {
            board.value = turnBoard(board.value, BoardSize)
        }
        board.value = loadPosition(props.boardPosition.value, BoardSize);
    }, [props.boardPosition.value]);

    useEffect(() => {
        if (boardOrientation.current === props.player.value.color) return;
        if (props.player.value.color === Color.BLACK) {
            board.value = turnBoard(board.value, BoardSize)
            boardOrientation.current = Color.BLACK;
        } else {
            board.value = turnBoard(board.value, BoardSize)
            boardOrientation.current = Color.WHITE;
        }
    }, [props.player.value]);

    const flipBoard = () => {
        board.value = turnBoard(board.value, BoardSize);
        boardOrientation.current = boardOrientation.current === Color.WHITE ? Color.BLACK as PieceColor : Color.WHITE as PieceColor;
    };

    const makeClientMove = (move: Move, specialMove: SpecialMove | undefined) => {
        board.value = movePiece(move, board.value, specialMove);
        props.reportMove(move);
    }

    const makeServerMove = (move: Move, specialMove: SpecialMove | undefined) => {
        board.value = movePiece(move, board.value, specialMove);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="board" id="mainboard">
                {
                    board.value.map((row, rindex) => <div className="row" id={`r${rindex}`} key={rindex.toString()}>{
                        row.map((_, cindex) => {
                            return <Square key={cindex.toString()} rindex={rindex} cindex={cindex} makeMove={makeClientMove}
                                piece={board.value[rindex][cindex]} boardOrientation={boardOrientation.current} validMoves={props.validMoves}
                                specialMoves={props.specialMoves.value} />
                        })
                    }</div>)
                }
            </div>
        </DndProvider>
    );
}

function Square(props: {
    rindex: number, cindex: number, makeMove: (move: Move, specialMove: SpecialMove | undefined) => void, piece: string,
    boardOrientation: PieceColor, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>, specialMoves: SpecialMove[]
}) {
    const pieceRef = useRef<Piece | undefined>();

    const posAbsolut = useMemo<PositionAbsolute>(() => {
        if (props.boardOrientation === Color.WHITE) {
            return (colToLetter.get(props.cindex) + (BoardSize - props.rindex).toString());
        } else {
            return (colToLetter.get(BoardSize - props.cindex - 1) + (props.rindex + 1).toString());
        }
    }, [props.boardOrientation])

    const positionInfo = useMemo<PositionInfo>(() => {
        const pieceType = props.piece.toUpperCase() as PieceType || undefined;
        const pieceColor = props.piece === "" ? undefined : (props.piece === props.piece.toUpperCase() ? Color.WHITE : Color.BLACK);
        return [pieceType, pieceColor]
    }, [props.piece])

    const onDrop = (item: Piece) => {
        let move: Move = {
            fromRelative: item.positionRelative,
            toRelative: [props.rindex, props.cindex],
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
            positionRelative: [props.rindex, props.cindex],
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