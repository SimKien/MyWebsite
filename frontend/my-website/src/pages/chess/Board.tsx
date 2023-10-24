import { useEffect, useState } from "react";
import "./Board.css";
import {Piece, PieceComponent, PieceType, PositionInfo} from "pages/chess/Piece";

function is_numeric(str: string){
    return /^\d$/.test(str);
}

function loadPosition(fen: string, size: number, setBoard: (board: Array<Array<PositionInfo>>) => void) {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; i++) {
            let square = document.getElementById(`r${i}c${j}`);
            if (square) {
                square.innerHTML = "";
            }
        }
    }
    let result = new Array<Array<PositionInfo>>(size);
    for (let i: number = 0; i < size; i++) {
        result[i] = new Array<PositionInfo>(size);
        for (let j: number = 0; j < size; j++) {
            result[i][j] = [undefined, undefined];
        }
    }
    let pos = fen.split(" ")[0];
    let rownumber = 0;
    let colnumber = 0;
    for (let letter of pos) {
        if (letter === "/") {
            rownumber += 1;
            colnumber = 0;
        } else if (is_numeric(letter)) {
            colnumber += parseInt(letter);
        } else {
            let piece: Piece = {
                position: [rownumber, colnumber],
                type: letter.toUpperCase() as PieceType,
                color: letter === letter.toUpperCase() ? "white" : "black"
            };
            let pieceComponent = PieceComponent({piece: piece});
            let square = document.getElementById(`r${rownumber}c${colnumber}`);
            result[rownumber][colnumber] = [letter.toUpperCase() as PieceType, letter === letter.toUpperCase() ? "white" : "black"];
            if (square) {
                
            }
            colnumber += 1;
        }
    }
    setBoard(result);
}


export default function Board() {
    const size = 8;
    const [board, setBoard] = useState(new Array<Array<PositionInfo>>());
    const [fen, setFEN] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

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

    

    return(
        <div className="board">
            {
                board.map((row, rindex) => <div className="row">{
                        row.map((_, cindex) => {
                            return <div id={`r${rindex}c${cindex}`} className={`square ${(rindex + cindex) % 2 === 0 ? "white" : "black"}`}></div>;
                        })
                    }</div>
                )
            }
        </div>
    );
}