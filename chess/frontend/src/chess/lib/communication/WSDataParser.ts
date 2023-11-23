import { WebsocketMessage, MoveTypes, WebsocketTypes } from "chess/lib/constants/WebsocketConstants"
import { Move, PieceType, SpecialMove } from "chess/lib/constants/ChessConstants"

export const convertToMoveInformation = (move: Move, specialMove: SpecialMove | undefined) => {
    let moveInfo: WebsocketMessage = {
        messageType: WebsocketTypes.MOVE,
        from: move.fromAbsolute,
        to: move.toAbsolute,
        moveType: MoveTypes.NORMAL,
        promotionPiece: move.promotionPiece
    }
    if (specialMove) {
        moveInfo.moveType = specialMove.specialType
    }
    return moveInfo
}

export const convertToMoves = (moveInformation: WebsocketMessage) => {
    let move: Move = {
        fromAbsolute: moveInformation.from,
        toAbsolute: moveInformation.to,
        fromRelative: [-1, -1],                                     //set coordinates to undefined
        toRelative: [-1, -1],
        promotionPiece: moveInformation.promotionPiece as PieceType
    }

    let specialMove: SpecialMove | undefined = undefined
    if (moveInformation.moveType !== MoveTypes.NORMAL) {
        specialMove = {
            fromAbsolute: moveInformation.from,
            toAbsolute: moveInformation.to,
            specialType: moveInformation.moveType
        }
    }

    return [move, specialMove] as [Move, SpecialMove | undefined]
}