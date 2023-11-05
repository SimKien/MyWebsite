import { Move } from "pages/chess/lib/constants/ChessConstants";

export function movePiece(move: Move, board: string[][]) {
    let result = new Array<Array<string>>(board.length);
    for (let i: number = 0; i < board.length; i++) {
        result[i] = new Array<string>(board.length);
        for (let j: number = 0; j < board.length; j++) {
            result[i][j] = board[i][j];
        }
    }
    let temp = result[move.from[0]][move.from[1]];
    result[move.from[0]][move.from[1]] = "";
    result[move.to[0]][move.to[1]] = temp;
    return result;
}

export function turnBoard(board: string[][], size: number) {
    let result = new Array<Array<string>>(size);
    for (let i: number = 0; i < size; i++) {
        result[i] = new Array<string>(size);
        for (let j: number = 0; j < size; j++) {
            result[i][j] = board[size - 1 - i][size - 1 - j];
        }
    }
    return result;
}

function is_numeric(str: string) {
    return /^\d+$/.test(str);
}

export function loadPosition(boardPosition: string, size: number) {
    let result = new Array<Array<string>>(size);
    for (let i: number = 0; i < size; i++) {
        result[i] = new Array<string>(size);
        for (let j: number = 0; j < size; j++) {
            result[i][j] = "";
        }
    }
    let rownumber = 0;
    let colnumber = 0;
    for (let letter of boardPosition) {
        if (letter === "/") {
            rownumber += 1;
            colnumber = 0;
        } else if (is_numeric(letter)) {
            colnumber += parseInt(letter);
        } else {
            result[rownumber][colnumber] = letter;
            colnumber += 1;
        }
    }
    return result;
}