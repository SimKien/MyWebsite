import { MoveInformation, MoveTypes, WebsocketTypes } from "chess/lib/constants/WebsocketConstants"
import { Move, PieceType, SpecialMove } from "chess/lib/constants/ChessConstants"

export const convertToMoveInformation = (move: Move, specialMove: SpecialMove | undefined) => {
    let moveInfo: MoveInformation = {
        messageType: WebsocketTypes.MOVE,
        from: move.fromAbsolute,
        to: move.toAbsolute,
        moveType: MoveTypes.NORMAL
    }
    if (specialMove) {
        moveInfo.moveType = specialMove.type
        if (specialMove.type === MoveTypes.PROMOTION) {
            moveInfo.promotionPiece = move.promotionPiece
        }
    }
    return moveInfo
}

export const convertToMoves = (moveInformation: MoveInformation) => {
    let move: Move = {
        fromAbsolute: moveInformation.from,
        toAbsolute: moveInformation.to,
        fromRelative: [-1, -1],                 //set coordinates to undefined
        toRelative: [-1, -1]
    }

    let specialMove: SpecialMove | undefined = undefined
    if (moveInformation.moveType !== MoveTypes.NORMAL) {
        specialMove = {
            fromAbsolute: moveInformation.from,
            toAbsolute: moveInformation.to,
            type: moveInformation.moveType
        }
        if (moveInformation.moveType === MoveTypes.PROMOTION) {
            move.promotionPiece = moveInformation.promotionPiece as PieceType
        }
    }

    return [move, specialMove] as [Move, SpecialMove | undefined]
}