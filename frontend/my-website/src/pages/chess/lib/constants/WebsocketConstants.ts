import { PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";

//type of a websocket handler
export type WebsocketHandler = (message: string) => void;

//hints for special moves
export const MoveHints = {
    CASTLING_KING_SIDE: "castling-king-side",
    CASTLING_QUEEN_SIDE: "castling-queen-side",
    QUEEN_PROMOTION: "queen-promotion",
    ROOK_PROMOTION: "rook-promotion",
    BISHOP_PROMOTION: "bishop-promotion",
    KNIGHT_PROMOTION: "knight-promotion",
    NONE: "none"
}

//types of moves
export const MoveType = {
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
    type: string,
    from: PositionAbsolute,
    to: PositionAbsolute,
    moveType: string,
    moveHint: string
};

//send and receive json of endpoint /game
export type GameInformation = {
    id: string,
    token: string,
    color?: string
}

//receive of endpoint /board-position
export type BoardPositionInformation = {
    boardPosition: string
}

//receive of endpoint /valid-moves
export type ValidMovesInformation = {
    validMoves: Map<PositionAbsolute, PositionAbsolute[]>
}

//receive of endpoint /player
export type PlayerInformation = {
    id: string,
    token: string
}