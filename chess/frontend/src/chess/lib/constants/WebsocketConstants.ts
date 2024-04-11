//type of a websocket handler
export type WebsocketHandler = (message: string) => void;

//types of websocket messages
export const WebsocketTypes = {
    MOVE: "move",
    PING: "ping",
}
