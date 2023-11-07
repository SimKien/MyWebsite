import { PieceColor, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";

export const chessServerEndpoint = "ws://localhost:8080/chess";

export type WebsocketHandler = (message: string) => void;

export type MoveInformation = {
    kind: 'move',
    from: PositionAbsolute,
    to: PositionAbsolute
} | { kid: 'rochade' } | { kind: 'enpassant' } | { kind: 'promotion', pos: PositionAbsolute, piece: string };

export type GameState = {
    boardString: string,
    playerInfo: { [K: string]: PieceColor },
    currentTurn: PieceColor,
}

export type InitInformation = {
    color: PieceColor
}