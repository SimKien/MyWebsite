import { create } from "zustand";
import { persist } from "zustand/middleware";
import { USER_STORE_KEY } from "chess/lib/constants/UserConstants";

export interface UserMetaStore {
    userId: string;
    token: string;
    valid: boolean;
    setUserId: (userId: string) => void;
    setToken: (token: string) => void;
    setValid: (valid: boolean) => void;
}

export const useUserStore = create<UserMetaStore>()(
    persist(
        (set) => ({
            userId: "",
            token: "",
            valid: false,
            setUserId: (userId: string) => set({ userId }),
            setToken: (token: string) => set({ token }),
            setValid: (valid: boolean) => set({ valid }),
        }),
        { name: USER_STORE_KEY }
    )
);