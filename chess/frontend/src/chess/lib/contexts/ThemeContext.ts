import { createContext } from "react";
import { defaultTheme } from "chess/lib/constants/ContextConstants";

export const ThemeContext = createContext(defaultTheme);