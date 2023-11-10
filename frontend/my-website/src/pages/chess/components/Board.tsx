import { useEffect, useMemo, useRef } from "react";
import "pages/chess/style/Board.css";
import { PieceComponent } from "pages/chess/components/Piece";
import { Color, PieceColor, PieceType, Piece_dnd_type, Piece, Move, BoardSize, BoardOperations, PositionAbsolute, colToLetter, PositionInfo } from "pages/chess/lib/constants/ChessConstants"
import { loadPosition, movePiece, turnBoard, isWhiteSquare } from "pages/chess/lib/BoardOperations";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Signal, signal } from "@preact/signals-react";
import { Player, usePlayerStore } from "pages/chess/lib/Game";

const board = signal<string[][]>((new Array(BoardSize).fill(new Array(BoardSize).fill(""))));

export default function Board(props: {
    boardPosition: Signal<string>, reportMove: (move: Move) => void, player: Signal<Player>,
    boardOperations: BoardOperations, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>
}) {
    const playerStore = usePlayerStore();

    const boardOrientation = useRef<PieceColor>(Color.White as PieceColor);

    useEffect(() => {
        props.boardOperations.flipBoard = flipBoard;
        props.boardOperations.makeMove = makeServerMove;
    }, []);

    useEffect(() => {
        if (boardOrientation.current === Color.Black) {
            board.value = turnBoard(board.value, BoardSize)
        }
        board.value = loadPosition(props.boardPosition.value, BoardSize);
    }, [props.boardPosition.value]);

    useEffect(() => {
        if (boardOrientation.current === props.player.value.color) return;
        if (props.player.value.color === Color.Black) {
            board.value = turnBoard(board.value, BoardSize)
            boardOrientation.current = Color.Black;
        } else {
            board.value = turnBoard(board.value, BoardSize)
            boardOrientation.current = Color.White;
        }
        playerStore.setId(props.player.value.id);
        playerStore.setToken(props.player.value.token);
    }, [props.player.value]);

    const flipBoard = () => {
        board.value = turnBoard(board.value, BoardSize);
        boardOrientation.current = boardOrientation.current === Color.White ? Color.Black as PieceColor : Color.White as PieceColor;
    };

    const makeClientMove = (move: Move) => {
        board.value = movePiece(move, board.value);
        props.reportMove(move);
    }

    const makeServerMove = (move: Move) => {
        board.value = movePiece(move, board.value);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="board" id="mainboard">
                {
                    board.value.map((row, rindex) => <div className="row" id={`r${rindex}`} key={rindex.toString()}>{
                        row.map((_, cindex) => {
                            return <Square key={cindex.toString()} rindex={rindex} cindex={cindex} makeMove={makeClientMove}
                                piece={board.value[rindex][cindex]} boardOrientation={boardOrientation.current} validMoves={props.validMoves} />
                        })
                    }</div>)
                }
            </div>
        </DndProvider>
    );
}

function Square(props: {
    rindex: number, cindex: number, makeMove: (move: Move) => void, piece: string,
    boardOrientation: PieceColor, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>
}) {
    const pieceRef = useRef<Piece | undefined>();

    const posAbsolut = useMemo<PositionAbsolute>(() => {
        if (props.boardOrientation === Color.White) {
            return (colToLetter.get(props.cindex) + (BoardSize - props.rindex).toString());
        } else {
            return (colToLetter.get(BoardSize - props.cindex - 1) + (props.rindex + 1).toString());
        }
    }, [props.boardOrientation])

    const positionInfo = useMemo<PositionInfo>(() => {
        const pieceType = props.piece.toUpperCase() as PieceType || undefined;
        const pieceColor = props.piece === "" ? undefined : (props.piece === props.piece.toUpperCase() ? Color.White : Color.Black);
        return [pieceType, pieceColor]
    }, [props.piece])

    const onDrop = (item: Piece) => {
        let move: Move = {
            fromRelative: item.positionRelative,
            toRelative: [props.rindex, props.cindex],
            fromAbsolute: item.positionAbsolute,
            toAbsolute: posAbsolut,
            movedPiece: item
        }
        props.makeMove(move);
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
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${isWhiteSquare(props.rindex, props.cindex) ? Color.White : Color.Black}`}
                ref={drop}>
                {(isOver && !isOverOriginField) ?
                    <div className="hoveredStyle">
                        <DropableMarker isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} containsPiece={false} isWhite={isWhiteSquare(props.rindex, props.cindex)} />
                    </div> :
                    <DropableMarker isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} containsPiece={false} isWhite={isWhiteSquare(props.rindex, props.cindex)} />
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
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${isWhiteSquare(props.rindex, props.cindex) ? Color.White : Color.Black}`}
                ref={drop}>
                {(isOver && !isOverOriginField) ? (
                    <div className="hoveredStyle">
                        <DropableMarker isDropableArea={isDropableArea} isOverOriginField={isOverOriginField} containsPiece={true} isWhite={isWhiteSquare(props.rindex, props.cindex)} />
                        <PieceComponent piece={pieceRef.current} />
                    </div>
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
                <>
                    <div className="dropableMarkerWithPiece">
                        <span className={`dropableMarkerWithPieceOverlap ${props.isWhite ? Color.White : Color.Black}`}></span>
                    </div>
                </> :
                <div className="dropableMarkerWithoutPiece"></div>
        ) :
            <></>
    );
}