import { useEffect, useState } from "react";
import "./Board.css";

export default function Board() {
    const size = 8;
    const [board, setBoard] = useState(new Array<Array<string>>());

    useEffect(() => {
        const result = new Array<Array<string>>(size);
        for (let i: number = 0; i < size; i++) {
            result[i] = new Array<string>(size);
            for (let j: number = 0; j < size; j++) {
                result[i][j] = "";
            }
        }
        setBoard(result);
    }, []);

    return(
        <div className="board">
            {
                board.map((row, rindex) => {
                    return <div className="row">{
                        row.map((_, cindex) => {
                            return <div className={`square ${(rindex + cindex) % 2 === 0 ? "white" : "black"}`}></div>;
                        })
                    }</div>;
                })
            }
        </div>
    );
}