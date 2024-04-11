import { Color, PieceColor } from "chess/lib/constants/ChessConstants";
import { defaultUser } from "chess/lib/constants/ContextConstants";

export const USER_STORE_KEY = "user";

export interface User {
    userId: string;
    token: string;
    valid: boolean;
}

export interface Player {
    user: User;
    color: PieceColor;
}

export const defaultPlayer: Player = {
    user: defaultUser,
    color: Color.WHITE
}