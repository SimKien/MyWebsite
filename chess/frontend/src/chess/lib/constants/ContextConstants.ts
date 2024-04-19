import { User } from "chess/lib/constants/UserConstants";
import { Theme } from "chess/lib/constants/StyleConstants";
import { BoardInformation, Move, PositionAbsolute } from "chess/lib/constants/BoardConstants";
import { SpecialMove } from "chess/lib/constants/CommunicationConstants";
import { Color } from "chess/lib/constants/ChessConstants";

export const defaultUser: User = {
    userId: "",
    token: "",
    valid: false
};

export const defaultTheme: Theme = { darkMode: false };

export const defaultBoardContext: BoardInformation = {
    validMoves: new Map<PositionAbsolute, PositionAbsolute[]>(),
    specialMoves: new Array<SpecialMove>(),
    orientation: Color.WHITE,
    makeClientMove: (move: Move, specialMove: SpecialMove | undefined) => {
        console.log(move);
        console.log(specialMove);
    }
};