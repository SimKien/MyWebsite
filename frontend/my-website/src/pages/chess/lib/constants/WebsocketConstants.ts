import { PieceColor, PositionAbsolute, SpecialMove } from "pages/chess/lib/constants/ChessConstants";

//type of a websocket handler
export type WebsocketHandler = (message: string) => void;

//types of moves
export const MoveTypes = {
    CASTLING: "castling",
    EN_PASSANT: "en-passant",
    PROMOTION: "promotion",
    NORMAL: "normal"
}

//types of websocket messages
export const WebsocketTypes = {
    MOVE: "move"
}

//send and receive json of move of websocket connection
export type MoveInformation = {
    messageType: string,
    from: PositionAbsolute,
    to: PositionAbsolute,
    moveType: string,
    promotionPiece?: string
};

//receive json of endpoint /game
export type PlayerGameInformation = {
    id: string,
    token: string,
    color: PieceColor
}

//receive of endpoint /board-position
export type BoardPositionInformation = {
    boardPosition: string
}

//receive of endpoint /valid-moves
export type ValidMovesInformation = {
    validMoves: Map<PositionAbsolute, PositionAbsolute[]>
    specialMoves: SpecialMove[]
}

//receive of endpoint /player ans send of endpoint /game and /board-position
export type PlayerInformation = {
    id: string,
    token: string
}