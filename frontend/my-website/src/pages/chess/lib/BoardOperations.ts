import { Move, SpecialMove } from "pages/chess/lib/constants/ChessConstants";
import { MoveTypes } from "pages/chess/lib/constants/WebsocketConstants";

export function isWhiteSquare(rindex: number, cindex: number) {
    return (rindex + cindex) % 2 === 0;
}

function isNumeric(str: string) {
    return /^\d+$/.test(str);
}

export function movePiece(move: Move, board: string[][], specialMove: SpecialMove | undefined) {
    let result = new Array<Array<string>>(board.length);
    for (let i: number = 0; i < board.length; i++) {
        result[i] = board[i];
    }
    const temp = result[move.fromRelative[0]][move.fromRelative[1]];
    result[move.fromRelative[0]][move.fromRelative[1]] = "";
    result[move.toRelative[0]][move.toRelative[1]] = temp;
    if (specialMove) {
        if (specialMove.type === MoveTypes.CASTLING) {
            const rookTargetCol = (move.toRelative[1] + move.fromRelative[1]) / 2;
            const rookSourceCol = move.toRelative[1] > move.fromRelative[1] ? 7 : 0;
            result[move.toRelative[0]][rookTargetCol] = result[move.toRelative[0]][rookSourceCol];
            result[move.fromRelative[0]][rookSourceCol] = "";
        } else if (specialMove.type === MoveTypes.EN_PASSANT) {
            const enPassantTargetRow = move.fromRelative[0]
            result[enPassantTargetRow][move.toRelative[1]] = "";
        } else if (specialMove.type === MoveTypes.PROMOTION) {
            if (move.promotionPiece === undefined) return result;
            let promotionPiece = move.promotionPiece
            result[move.toRelative[0]][move.toRelative[1]] = promotionPiece;
        }
    }
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
        } else if (isNumeric(letter)) {
            colnumber += parseInt(letter);
        } else {
            result[rownumber][colnumber] = letter;
            colnumber += 1;
        }
    }
    return result;
}