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
    MOVE: "move",
    PING: "ping",
}
