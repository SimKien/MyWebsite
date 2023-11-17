import { useEffect, useState } from "react";
import "tictactoe/tictactoe.css"

const boardSize: number = 3;

function checkVictory(board: Array<Array<string>>, size: number) {
    let state: string = "";
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            state += board[i][j];
        }
    }
    let xpat1: string = `(^([XO ]{${size}})*X{${size}}([XO ]{${size}})*$)`;                                     //x won by row
    let xpat2: string = `(^[XO ]*(X[XO ]{${size - 1}}){${size - 1}}X[XO ]*$)`;                                  //x won by col
    let xpat3: string = `(^(X[XO ]{${size}}){${size - 1}}X$)`;                                                  //won by diag
    let xpat4: string = `(^[XO ]{${size - 1}}(X[XO ]{${size - 2}}){${size - 1}}X[XO ]*$)`;                      //won by diag
    let xreg1 = new RegExp(xpat1, "i");
    let xreg2 = new RegExp(xpat2, "i");
    let xreg3 = new RegExp(xpat3, "i");
    let xreg4 = new RegExp(xpat4, "i");
    let xwon: boolean = xreg1.test(state) || xreg2.test(state) || xreg3.test(state) || xreg4.test(state);       //wheter X won
    let opat1: string = `(^([XO ]{${size}})*O{${size}}([XO ]{${size}})*$)`;                                     //o won by row
    let opat2: string = `(^[XO ]*(O[XO ]{${size - 1}}){${size - 1}}O[XO ]*$)`;                                  //o won by col
    let opat3: string = `(^(O[XO ]{${size}}){${size - 1}}O$)`;                                                  //won by diag
    let opat4: string = `(^[XO ]{${size - 1}}(O[XO ]{${size - 2}}){${size - 1}}O[XO ]*$)`;                      //won by diag
    let oreg1 = new RegExp(opat1, "i");
    let oreg2 = new RegExp(opat2, "i");
    let oreg3 = new RegExp(opat3, "i");
    let oreg4 = new RegExp(opat4, "i");
    let owon: boolean = oreg1.test(state) || oreg2.test(state) || oreg3.test(state) || oreg4.test(state);       //wheter O won
    if (owon || xwon) {
        if (owon) {
            return "O";
        } else {
            return "X";
        }
    } else return null;
}

function Square(props: { currentSymbol: string, changeSymbol: (row: number, col: number) => void, row: number, col: number, finished: boolean }) {
    const [symbol, setSymbol] = useState(" ");
    const [isClicked, setIsClicked] = useState(false);

    const click = () => {
        if (!isClicked && !props.finished) {
            setIsClicked(true);
            setSymbol(props.currentSymbol);
            props.changeSymbol(props.row, props.col);
        }
    }

    return (
        <div className="tictactoesquare" onClick={click}>{symbol}</div>
    );
}

function Board(props: { setWintext: (text: string) => void }) {
    const size: number = boardSize;
    const [board, setBoard] = useState(new Array<Array<string>>(size));

    const [currentSymbol, setCurrentSymbol] = useState("X");
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        let result = new Array<Array<string>>(size);

        for (let i = 0; i < size; i++) {
            result[i] = new Array<string>(size);
            for (let j = 0; j < size; j++) {
                result[i][j] = " ";
            }
        }

        setBoard(result);
    }, []);

    const processMove = (row: number, col: number) => {
        let result = board;
        result[row][col] = currentSymbol;
        setBoard(result);
        setCurrentSymbol(currentSymbol === "X" ? "O" : "X");
        let victory = checkVictory(board, size);
        if (victory !== null) {
            props.setWintext(victory + " won!");
            setFinished(true);
        }
    };

    return (
        <div className="tictactoeboard">
            {board.map((row, rowindex) => {
                return <div key={rowindex} className="tictactoerow">
                    {row.map((_, colindex) => {
                        return <Square key={colindex} currentSymbol={currentSymbol} changeSymbol={processMove} row={rowindex} col={colindex} finished={finished} />
                    })}
                </div>;
            })}
        </div>
    );
}

export default function TicTacToe() {
    const [wintext, setWintext] = useState("");

    return (
        <div className="tictactoemainbox">
            <h1 className="title">TicTacToe</h1>
            <Board setWintext={setWintext} />
            <button className="refreshbutton" onClick={() => { window.location.reload() }}>Restart</button>
            <p className="wintext">{wintext}</p>
        </div>
    );
}
