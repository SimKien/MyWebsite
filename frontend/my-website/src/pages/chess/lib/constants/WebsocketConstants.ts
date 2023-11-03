export const chessServerEndpoint = "ws://localhost:8080/chess";

export type WebsocketHandler = (message: string) => void;