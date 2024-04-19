import { createContext } from "react";
import { defaultBoardContext } from "chess/lib/constants/ContextConstants";

export const BoardContext = createContext(defaultBoardContext);