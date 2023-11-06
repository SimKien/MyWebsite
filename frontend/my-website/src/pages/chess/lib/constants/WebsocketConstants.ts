import { PieceColor } from "pages/chess/lib/constants/ChessConstants";

export const chessServerEndpoint = "ws://localhost:8080/chess";

export type WebsocketHandler = (message: string) => void;

export type MoveInformation = {
    from: string,
    to: string
}

export type BoardInformation = {
    boardString: string
}

export type InitInformation = {
    color: PieceColor
}