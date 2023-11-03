import { PieceColor, PieceType, PositionInfo, Move, Color } from "pages/chess/lib/constants/ChessConstants";

export function movePiece(move: Move, board: PositionInfo[][]) {
    let temp = board[move.from[0]][move.from[1]];
    board[move.from[0]][move.from[1]] = [undefined, undefined];
    board[move.to[0]][move.to[1]] = temp;
}

export function turnBoard(board: PositionInfo[][], size: number) {
    let result = new Array<Array<PositionInfo>>(size);
    for (let i: number = 0; i < size; i++) {
        result[i] = new Array<PositionInfo>(size);
        for (let j: number = 0; j < size; j++) {
            result[i][j] = board[size - 1 - i][size - 1 - j];
        }
    }
    for (let i: number = 0; i < size; i++) {
        for (let j: number = 0; j < size; j++) {
            board[i][j] = result[i][j];
        }
    }
}

function is_numeric(str: string) {
    return /^\d+$/.test(str);
}

export function loadPosition(fen: string, size: number, board: PositionInfo[][]) {
    for (let i: number = 0; i < size; i++) {
        board[i] = new Array<PositionInfo>(size);
        for (let j: number = 0; j < size; j++) {
            board[i][j] = [undefined, undefined];
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
            board[rownumber][colnumber] = [letter.toUpperCase() as PieceType, letter === letter.toUpperCase() ? Color.White as PieceColor : Color.Black as PieceColor];
            colnumber += 1;
        }
    }
}