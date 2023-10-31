import { PieceColor, PieceType, PositionInfo, Move, Color } from "pages/chess/Constants";

export function movePiece(move: Move, board: Array<Array<PositionInfo>>) {
    let length: number = board.length;
    let result = new Array<Array<PositionInfo>>(length);
    for (let i: number = 0; i < length; i++) {
        result[i] = new Array<PositionInfo>(length);
        for (let j: number = 0; j < length; j++) {
            result[i][j] = board[i][j];
        }
    }
    let temp = result[move.from[0]][move.from[1]];
    result[move.from[0]][move.from[1]] = [undefined, undefined];
    result[move.to[0]][move.to[1]] = temp;
    return result;
}

export function turnBoard(board: Array<Array<PositionInfo>>, size: number) {
    let result = new Array<Array<PositionInfo>>(size);
    for (let i: number = 0; i < size; i++) {
        result[i] = new Array<PositionInfo>(size);
        for (let j: number = 0; j < size; j++) {
            result[i][j] = board[size - 1 - i][size - 1 - j];
        }
    }
    return result;
}

function is_numeric(str: string) {
    return /^\d+$/.test(str);
}

export function loadPosition(fen: string, size: number) {
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
            result[rownumber][colnumber] = [letter.toUpperCase() as PieceType, letter === letter.toUpperCase() ? Color.White as PieceColor : Color.Black as PieceColor];
            colnumber += 1;
        }
    }
    return result;
}