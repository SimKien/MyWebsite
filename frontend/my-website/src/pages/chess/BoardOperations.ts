import { PieceColor, PieceType, PositionInfo } from "pages/chess/Piece";

export function turnBoard(board: Array<Array<PositionInfo>>, size: number, setBoard: (board: Array<Array<PositionInfo>>) => void) {
    let result = new Array<Array<PositionInfo>>(size);
    for (let i: number = 0; i < size; i++) {
        result[i] = new Array<PositionInfo>(size);
        for (let j: number = 0; j < size; j++) {
            result[i][j] = board[size - 1 - i][size - 1 - j];
        }
    }
    setBoard(result);
}

function is_numeric(str: string) {
    return /^\d$/.test(str);
}

export function loadPosition(fen: string, size: number, setBoard: (board: Array<Array<PositionInfo>>) => void) {
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
            result[rownumber][colnumber] = [letter.toUpperCase() as PieceType, letter === letter.toUpperCase() ? "white" : "black" as PieceColor];
            colnumber += 1;
        }
    }
    setBoard(result);
}