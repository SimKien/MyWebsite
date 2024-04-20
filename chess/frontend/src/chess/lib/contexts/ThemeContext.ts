import { createContext } from "react";
import { defaultTheme } from "chess/lib/constants/ContextConstants";
import { Theme } from "chess/lib/constants/StyleConstants";

export const ThemeContext = createContext<Theme>(defaultTheme);