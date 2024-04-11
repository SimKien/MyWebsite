import { WebsocketTypes } from "chess/lib/constants/WebsocketConstants"
import { MoveTypes, Move } from "chess/lib/constants/BoardConstants"
import { PieceType } from "chess/lib/constants/ChessConstants"
import { WebsocketMessage, SpecialMove } from "chess/lib/constants/CommunicationConstants"

export const convertToMoveMessage = (move: Move, specialMove: SpecialMove | undefined) => {
    let moveInfo: WebsocketMessage = {
        message_type: WebsocketTypes.MOVE,
        from: move.fromAbsolute,
        to: move.toAbsolute,
        move_type: MoveTypes.NORMAL,
        promotion_piece: move.promotionPiece
    }
    if (specialMove) {
        moveInfo.move_type = specialMove.special_type
    }
    return moveInfo
}

export const convertToMove = (moveInformation: WebsocketMessage) => {
    let move: Move = {
        fromAbsolute: moveInformation.from,
        toAbsolute: moveInformation.to,
        fromRelative: [-1, -1],                                     //set relative coordinates to undefined
        toRelative: [-1, -1],                                       //set relative coordinates to undefined
        promotionPiece: moveInformation.promotion_piece as PieceType
    }

    let specialMove: SpecialMove | undefined = undefined
    if (moveInformation.move_type !== MoveTypes.NORMAL) {
        specialMove = {
            from_absolute: moveInformation.from,
            to_absolute: moveInformation.to,
            special_type: moveInformation.move_type
        }
    }

    return [move, specialMove] as [Move, SpecialMove | undefined]
}