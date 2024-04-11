import { createContext } from "react";
import { defaultUser } from "chess/lib/constants/ContextConstants";

export const UserContext = createContext(defaultUser);