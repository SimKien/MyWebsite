import { signal } from '@preact/signals-react';
import "chess/style/BasePartition.css"
import { defaultUser, defaultTheme } from 'chess/lib/constants/ContextConstants';
import { UserContext } from 'chess/lib/contexts/UserContext';
import { ThemeContext } from 'chess/lib/contexts/ThemeContext';
import { User } from 'chess/lib/constants/UserConstants';
import { Theme } from 'chess/lib/constants/StyleConstants';
import { Session } from 'chess/lib/Session';
import { useEffect } from 'react';
import Navbar from 'chess/components/navbar/Navbar';
import MainField from 'chess/components/Mainfield';
import { useUserStore } from './lib/storage/UserStorage';
import { ClientManagementContext } from 'chess/lib/contexts/ClientManagementContext';
import { ClientManagement } from 'chess/lib/constants/SessionConstants';

const user = signal<User>(defaultUser);
const theme = signal<Theme>(defaultTheme);

const session = new Session(user);                              //Main Session for the application which handles session information
const clientManagement: ClientManagement = {                    //Client Management object which is used to manage the client for the context
    setTheme: (newTheme: Theme) => {
        theme.value = newTheme
    },
    logIn: () => {
        session.logIn()
    },
    logOut: () => {
        session.logOut()
    }
}

export default function BasePartition() {
    
    const userStore = useUserStore()                            //React hook to access user stored in web browser
    
    useEffect(() => {
        void session.initSession(userStore)                     //Init Session with current user stored in web browser
    }, []);

    return (
        <UserContext.Provider value={session.user.value}>
            <ThemeContext.Provider value={theme.value}>
                <div className="basePartition_main">
                    <ClientManagementContext.Provider value={clientManagement}>
                        <Navbar />
                    </ClientManagementContext.Provider>
                    <MainField />
                </div>
            </ThemeContext.Provider>
        </UserContext.Provider>
    );
}