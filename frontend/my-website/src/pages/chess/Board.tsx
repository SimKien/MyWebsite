import { useEffect, useRef, useState } from "react";
import "pages/chess/Board.css";
import { PieceComponent } from "pages/chess/Piece";
import { Color, PieceColor, PieceType, PositionInfo, Piece_dnd_type, Piece, Move } from "pages/chess/Constants"
import { turnBoard, loadPosition, movePiece } from "pages/chess/BoardOperations";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


//TODO: probably replace useState in Board (what is useReducer?)
//TODO: make Piece in Square invisible when dragging


export default function Board() {
    const size = 8;
    const [board, setBoard] = useState<Array<Array<PositionInfo>>>(new Array<Array<PositionInfo>>());
    const [fen, setFEN] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    useEffect(() => {
        let result = loadPosition(fen, size);
        setBoard(result);
    }, [fen]);

    const makeMove = (move: Move) => {
        let result = movePiece(move, board);
        setBoard(result);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="board" id="mainboard">
                {
                    board.map((row, rindex) => <div className="row" id={`r${rindex}`} key={rindex.toString()}>{
                        row.map((_, cindex) => {
                            return <Square key={cindex.toString()} positionInfo={board[rindex][cindex]} rindex={rindex} cindex={cindex}
                                makeMove={makeMove} />
                        })
                    }</div>)
                }
            </div>
        </DndProvider>
    );
}

function Square(props: { positionInfo: PositionInfo, rindex: number, cindex: number, makeMove: (move: Move) => void }) {
    const pieceRef = useRef<Piece | undefined>();

    const onDrop = (item: Piece) => {
        let move: Move = {
            from: item.position,
            to: [props.rindex, props.cindex],
            movedPiece: item
        }
        props.makeMove(move);
    }

    const [{ isOver }, drop] = useDrop({
        accept: Piece_dnd_type,
        drop: (item, _) => onDrop(item as Piece),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        })
    });

    if (props.positionInfo[0] === undefined || props.positionInfo[1] === undefined) {
        pieceRef.current = undefined;
        return (
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${(props.rindex + props.cindex) % 2 === 0 ? Color.White : Color.Black}`}
                ref={drop}>
                {isOver ? <div style={{ backgroundColor: 'yellow', height: "100%", width: "100%" }}></div> : <></>}
            </div>
        );
    } else {
        let newPiece: Piece = {
            position: [props.rindex, props.cindex],
            type: props.positionInfo[0] as PieceType,
            color: props.positionInfo[1] as PieceColor
        }
        pieceRef.current = newPiece;
        return (
            <div id={`r${props.rindex}c${props.cindex}`} className={`square ${(props.rindex + props.cindex) % 2 === 0 ? Color.White : Color.Black}`}
                ref={drop}>
                {isOver ? (
                    <div style={{ backgroundColor: 'yellow', height: "100%", width: "100%" }}>
                        <PieceComponent piece={pieceRef.current} />
                    </div>
                ) :
                    <PieceComponent piece={pieceRef.current} />}
            </div>
        );
    }
}