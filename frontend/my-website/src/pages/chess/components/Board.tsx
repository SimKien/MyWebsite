import { useRef } from "react";
import "pages/chess/style/Board.css";
import { PieceComponent } from "pages/chess/components/Piece";
import { Color, PieceColor, PieceType, PositionInfo, Piece_dnd_type, Piece, Move } from "pages/chess/lib/constants/ChessConstants"
import { loadPosition, movePiece } from "pages/chess/lib/BoardOperations";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Signal, effect, signal } from "@preact/signals-react";

const size = 8;
const board = signal<PositionInfo[][]>((new Array(size).fill(new Array(size).fill([undefined, undefined]))) as PositionInfo[][]);

export default function Board(props: { fen: Signal<string> }) {

    effect(() => {
        loadPosition(props.fen.value, size, board.value);
    })

    const makeMove = (move: Move) => {
        movePiece(move, board.value);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="board" id="mainboard">
                {
                    board.value.map((row, rindex) => <div className="row" id={`r${rindex}`} key={rindex.toString()}>{
                        row.map((_, cindex) => {
                            return <Square key={cindex.toString()} rindex={rindex} cindex={cindex}
                                makeMove={makeMove} />
                        })
                    }</div>)
                }
            </div>
        </DndProvider>
    );
}

function Square(props: { rindex: number, cindex: number, makeMove: (move: Move) => void }) {
    const hovered_style = { backgroundColor: 'darkgreen', opacity: "0.4", height: "100%", width: "100%" };

    const pieceRef = useRef<Piece | undefined>();

    const positionInfo = board.value[props.rindex][props.cindex];

    const onDrop = (item: Piece) => {
        let move: Move = {
            from: item.position,
            to: [props.rindex, props.cindex],
            movedPiece: item
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