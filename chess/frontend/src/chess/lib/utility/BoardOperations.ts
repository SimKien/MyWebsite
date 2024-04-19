import { Color, PieceColor} from "chess/lib/constants/ChessConstants";
import { MoveTypes, Move, PositionAbsolute, PositionRelative, colToLetter, letterToCol, BoardSize} from "chess/lib/constants/BoardConstants";
import { SpecialMove } from "chess/lib/constants/CommunicationConstants";

export function isWhiteSquare(rindex: number, cindex: number): boolean {
    return (rindex + cindex) % 2 === 0;
}

function isNumeric(str: string) {
    return /^\d+$/.test(str);
}

export function getRelativePosition(position: PositionAbsolute, boardOrientation: PieceColor): PositionRelative {
    let positionSplit = position.split("");
    if (boardOrientation === Color.WHITE) {
        return [BoardSize - parseInt(positionSplit[1]), letterToCol.get(positionSplit[0]) ?? 0];
    } else {
        return [parseInt(positionSplit[1]) - 1, BoardSize - (letterToCol.get(positionSplit[0]) ?? 0) - 1];
    }
}

export function getAbsolutePosition(position: PositionRelative, boardOrientation: PieceColor): PositionAbsolute {
    if (boardOrientation === Color.WHITE) {
        return ((colToLetter.get(position[1]) ?? "a") + (BoardSize - position[0]).toString());
    } else {
        return ((colToLetter.get(BoardSize - position[1] - 1) ?? "a") + (position[0] + 1).toString());
    }
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
        switch (specialMove.special_type) {
            case MoveTypes.CASTLING:
                const rookTargetCol = (move.toRelative[1] + move.fromRelative[1]) / 2;
                const rookSourceCol = move.toRelative[1] > move.fromRelative[1] ? (BoardSize - 1) : 0;
                result[move.toRelative[0]][rookTargetCol] = result[move.toRelative[0]][rookSourceCol];
                result[move.fromRelative[0]][rookSourceCol] = "";
                break;
            case MoveTypes.EN_PASSANT:
                const enPassantTargetRow = move.fromRelative[0]
                result[enPassantTargetRow][move.toRelative[1]] = "";
                break;
            case MoveTypes.PROMOTION:
                if (move.promotionPiece === undefined) return result;
                let promotionPiece = result[move.toRelative[0]][move.toRelative[1]] === result[move.toRelative[0]][move.toRelative[1]].toUpperCase() ? move.promotionPiece.toUpperCase() : move.promotionPiece.toLowerCase();
                result[move.toRelative[0]][move.toRelative[1]] = promotionPiece;
                break;
        }
    }
    return result;
}

export function turnBoard(board: string[][]) {
    let result = new Array<Array<string>>(BoardSize);
    for (let i: number = 0; i < BoardSize; i++) {
        result[i] = new Array<string>(BoardSize);
        for (let j: number = 0; j < BoardSize; j++) {
            result[i][j] = board[BoardSize - 1 - i][BoardSize - 1 - j];
        }
    }
    return result;
}

export function loadPosition(boardPosition: string) {
    let result = new Array<Array<string>>(BoardSize);
    for (let i: number = 0; i < BoardSize; i++) {
        result[i] = new Array<string>(BoardSize);
        for (let j: number = 0; j < BoardSize; j++) {
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