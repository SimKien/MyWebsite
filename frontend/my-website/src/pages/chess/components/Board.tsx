import { useEffect, useRef } from "react";
import "pages/chess/style/Board.css";
import { PieceComponent } from "pages/chess/components/Piece";
import { Color, PieceColor, PieceType, Piece_dnd_type, Piece, Move, BoardSize, BoardOperations } from "pages/chess/lib/constants/ChessConstants"
import { loadPosition, movePiece, turnBoard } from "pages/chess/lib/BoardOperations";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { signal } from "@preact/signals-react";
import { Player } from "pages/chess/lib/Game";

const board = signal<string[][]>((new Array(BoardSize).fill(new Array(BoardSize).fill(""))));
const boardOrientation = signal<PieceColor>(Color.White as PieceColor);

export default function Board(props: { boardPosition: string, reportMove: (move: Move) => void, player: Player, boardOperations: BoardOperations }) {

    const flipBoard = () => {
        board.value = turnBoard(board.value, BoardSize);
        boardOrientation.value = boardOrientation.value === Color.White ? Color.Black as PieceColor : Color.White as PieceColor;
    };

    useEffect(() => {
        props.boardOperations.flipBoard = flipBoard;
        props.boardOperations.makeMove = makeServerMove;
    }, []);

    useEffect(() => {
        if (boardOrientation.value === Color.Black) {
            board.value = turnBoard(board.value, BoardSize)
        }
        board.value = loadPosition(props.boardPosition, BoardSize);
    }, [props.boardPosition]);

    useEffect(() => {
        if (boardOrientation.value === props.player.color) return;
        if (props.player.color === Color.Black) {
            board.value = turnBoard(board.value, BoardSize)
            boardOrientation.value = Color.Black as PieceColor;
        } else {
            board.value = turnBoard(board.value, BoardSize)
            boardOrientation.value = Color.White as PieceColor;
        }
    }, [props.player.color]);

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
                            return <Square key={cindex.toString()} rindex={rindex} cindex={cindex}
                                makeMove={makeClientMove} piece={board.value[rindex][cindex]} boardOrientation={boardOrientation.value} />
                        })
                    }</div>)
                }
            </div>
        </DndProvider>
    );
}

function Square(props: { rindex: number, cindex: number, makeMove: (move: Move) => void, piece: string, boardOrientation: PieceColor }) {
    console.log("rendering square");

    const hovered_style = { backgroundColor: 'darkgreen', opacity: "0.4", height: "100%", width: "100%" };

    const pieceRef = useRef<Piece | undefined>();

    const positionInfo = [props.piece === "" ? undefined : props.piece.toUpperCase() as PieceType, props.piece === "" ? undefined : (props.piece === props.piece.toUpperCase() ? Color.White as PieceColor : Color.Black as PieceColor)]

    const onDrop = (item: Piece) => {
        let move: Move = {
            from: item.position,
            to: [props.rindex, props.cindex],
            movedPiece: item,
            boardOrientation: props.boardOrientation
        }
        props.makeMove(move);
    }

    const [{ isOver, isOverOriginField }, drop] = useDrop({
        accept: Piece_dnd_type,
        drop: (item, _) => onDrop(item as Piece),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isOverOriginField: monitor.getItem() === null ? false : (monitor.getItem() as Piece).position[0] === props.rindex && (monitor.getItem() as Piece).position[1] === props.cindex
        })
    });

    if (positionInfo[0] === undefined || positionInfo[1] === undefined) {
        pieceRef.current = undefined;
        return (
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${(props.rindex + props.cindex) % 2 === 0 ? Color.White : Color.Black}`}
                ref={drop}>
                {(isOver && !isOverOriginField) ? <div style={hovered_style}></div> : <></>}
            </div>
        );
    } else {
        let newPiece: Piece = {
            position: [props.rindex, props.cindex],
            type: positionInfo[0] as PieceType,
            color: positionInfo[1] as PieceColor
        }
        pieceRef.current = newPiece;
        return (
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${(props.rindex + props.cindex) % 2 === 0 ? Color.White : Color.Black}`}
                ref={drop}>
                {(isOver && !isOverOriginField) ? (
                    <div style={hovered_style}>
                        <PieceComponent piece={pieceRef.current} />
                    </div>
                ) :
                    <PieceComponent piece={pieceRef.current} />}
            </div>
        );
    }
}