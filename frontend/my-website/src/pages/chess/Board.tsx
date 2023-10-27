import { useEffect, useRef, useState } from "react";
import "pages/chess/Board.css";
import { Piece, PieceComponent, PieceColor, PieceType, PositionInfo } from "pages/chess/Piece";
import { turnBoard, loadPosition } from "pages/chess/BoardOperations";

export default function Board(props: { mainbodyref: React.RefObject<HTMLDivElement> }) {
    const size = 8;
    const [board, setBoard] = useState(new Array<Array<PositionInfo>>());
    const [fen, setFEN] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const mainbodyref = props.mainbodyref;

    useEffect(() => {
        const result = new Array<Array<PositionInfo>>(size);
        for (let i: number = 0; i < size; i++) {
            result[i] = new Array<PositionInfo>(size);
            for (let j: number = 0; j < size; j++) {
                result[i][j] = [undefined, undefined];
            }
        }
        setBoard(result);
    }, []);

    useEffect(() => {
        loadPosition(fen, size, setBoard);
    }, [fen]);

    return (
        <div className="board" id="mainboard">
            {
                board.map((row, rindex) => <div className="row" id={`r${rindex}`} key={rindex.toString()}>{
                    row.map((_, cindex) => {
                        return <Square mainbodyref={mainbodyref} key={cindex.toString()} positionInfo={board[rindex][cindex]} rindex={rindex} cindex={cindex} />
                    })
                }</div>)
            }
        </div>
    );
}

function Square(props: { positionInfo: PositionInfo, rindex: number, cindex: number, mainbodyref: React.RefObject<HTMLDivElement> }) {
    const [piece, setPiece] = useState<Piece | undefined>(undefined);
    const position = [props.rindex, props.cindex];

    const mainbodyref = props.mainbodyref;

    useEffect(() => {
        if (props.positionInfo[0] === undefined || props.positionInfo[1] === undefined) {
            setPiece(undefined);
        } else {
            let newPiece: Piece = {
                position: [props.rindex, props.cindex],
                type: props.positionInfo[0] as PieceType,
                color: props.positionInfo[1] as PieceColor
            }
            setPiece(newPiece);
        }
    }, [props.positionInfo]);

    return (
        <div id={`r${position[0]}c${position[1]}`} className={`square ${(props.rindex + props.cindex) % 2 === 0 ? "white" : "black"}`}>
            <PieceComponent piece={piece} mainbodyef={mainbodyref} />
        </div>
    );
}