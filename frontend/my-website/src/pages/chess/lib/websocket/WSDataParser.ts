import { BoardSize, Color, colToLetter, Move, PieceColor } from "pages/chess/lib/constants/ChessConstants";

export const getMoveInformation = (move: Move) => {
    let boardOrientation = move.boardOrientation
    if (boardOrientation === Color.Black) {
        return {
            from: colToLetter.get(BoardSize - 1 - move.from[1]) + (move.from[0] + 1).toString(),
            to: colToLetter.get(BoardSize - 1 - move.to[1]) + (move.to[0] + 1).toString()
        }
    } else {
        return {
            from: colToLetter.get(move.from[1]) + (BoardSize - 1 - move.from[0] + 1).toString(),
            to: colToLetter.get(move.to[1]) + (BoardSize - 1 - move.to[0] + 1).toString()
        }
    }
}