import { Theme } from "chess/lib/constants/StyleConstants";

export interface ClientManagement {
    setTheme: (newTheme: Theme) => void;
    logIn: () => void;
    logOut: () => void;
}