import { createContext } from "react";
import { defaultUser } from "chess/lib/constants/ContextConstants";
import { User } from "chess/lib/constants/UserConstants";

export const UserContext = createContext<User>(defaultUser);