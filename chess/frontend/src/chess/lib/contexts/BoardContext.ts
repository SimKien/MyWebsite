import { createContext } from "react";
import { defaultBoardContext } from "chess/lib/constants/ContextConstants";
import { BoardInformation } from "chess/lib/constants/BoardConstants";

export const BoardContext = createContext<BoardInformation>(defaultBoardContext);