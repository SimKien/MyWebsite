import { signal } from '@preact/signals-react';
import "chess/style/BasePartition.css"
import { defaultUser, defaultTheme } from 'chess/lib/constants/ContextConstants';
import { UserContext } from 'chess/lib/contexts/UserContext';
import { ThemeContext } from 'chess/lib/contexts/ThemeContext';
import { User } from 'chess/lib/constants/UserConstants';
import { Theme } from 'chess/lib/constants/StyleConstants';
import { Session } from 'chess/lib/Session';
import { useEffect } from 'react';
import Navbar from 'chess/components/Navbar';
import MainField from 'chess/components/Mainfield';
import { useUserStore } from './lib/storage/UserStorage';

const user = signal<User>(defaultUser);
const theme = signal<Theme>(defaultTheme);

export const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
}

const session = new Session(user);                              //Main Session for the application which handles session information

export default function BasePartition() {
    
    const userStore = useUserStore()                            //React hook to access user stored in web browser
    
    useEffect(() => {
        void session.initSession(userStore)                     //Init Session with current user stored in web browser
    }, []);

    return (
        <UserContext.Provider value={session.user.value}>
            <ThemeContext.Provider value={theme.value}>
                <div className="BasePartition_main">
                    <Navbar />
                    <MainField />
                </div>
            </ThemeContext.Provider>
        </UserContext.Provider>
    );
}