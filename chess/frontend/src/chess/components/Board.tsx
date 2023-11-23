import { useEffect, useRef } from "react";
import "chess/style/Board.css";
import { Color, PieceColor, Move, BoardSize, BoardOperations, PositionAbsolute } from "chess/lib/constants/ChessConstants"
import { loadPosition, movePiece, turnBoard, getRelativePosition } from "chess/lib/BoardOperations";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Signal, signal } from "@preact/signals-react";
import { Player } from "chess/lib/Game";
import { SpecialMove } from "chess/lib/constants/CommunicationConstants";
import Square from "chess/components/Square";

const board = signal<string[][]>((new Array(BoardSize).fill(new Array(BoardSize).fill(""))));

export default function Board(props: {
    boardPosition: Signal<string>, reportMove: (move: Move, specialMove: SpecialMove | undefined) => void, player: Signal<Player>,
    boardOperations: BoardOperations, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>,
    specialMoves: Signal<SpecialMove[]>
}) {
    const boardOrientation = useRef<PieceColor>(Color.WHITE as PieceColor);

    useEffect(() => {
        props.boardOperations.flipBoard = flipBoard;
        props.boardOperations.makeMove = makeServerMove;
    }, []);

    useEffect(() => {
        board.value = loadPosition(props.boardPosition.value, BoardSize);
        if (boardOrientation.current === Color.BLACK) {
            board.value = turnBoard(board.value, BoardSize)
        }
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
        props.reportMove(move, specialMove);
    }

    const makeServerMove = (move: Move, specialMove: SpecialMove | undefined) => {
        move.fromRelative = getRelativePosition(move.fromAbsolute as PositionAbsolute, BoardSize, boardOrientation.current as PieceColor);
        move.toRelative = getRelativePosition(move.toAbsolute as PositionAbsolute, BoardSize, boardOrientation.current as PieceColor)

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
                                specialMoves={props.specialMoves.value} size={BoardSize} />
                        })
                    }</div>)
                }
            </div>
        </DndProvider>
    );
}