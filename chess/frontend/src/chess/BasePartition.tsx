import { useSignal } from '@preact/signals-react';
import "chess/style/BasePartition.css"
import { defaultUser, defaultTheme } from 'chess/lib/constants/ContextConstants';
import { UserContext } from 'chess/lib/contexts/UserContext';
import { ThemeContext } from 'chess/lib/contexts/ThemeContext';
import { User } from 'chess/lib/constants/UserConstants';
import { Theme } from 'chess/lib/constants/StyleConstants';
import { Session } from 'chess/lib/Session';
import { useEffect, useRef } from 'react';
import Navbar from 'chess/components/navbar/Navbar';
import MainField from 'chess/components/Mainfield';
import { useUserStore } from './lib/storage/UserStorage';
import { ClientManagementContext } from 'chess/lib/contexts/ClientManagementContext';
import { ClientManagement } from 'chess/lib/constants/SessionConstants';


export default function BasePartition() {
    
    //storage hook
    const userStore = useUserStore()                            //React hook to access user stored in web browser

    //variables
    const user = useSignal<User>(defaultUser);
    const theme = useSignal<Theme>(defaultTheme);
    const sessionRef = useRef<Session | undefined>(undefined)   //Main Session for the application which handles session information, initialized to undefined so it is not recreated every time the component rerenders
    function getSession() {                                     //avoid undefined checks because of useRef is never undefined
        if (sessionRef.current !== undefined) {
            return sessionRef.current
        }
        const session = new Session(user)
        sessionRef.current = session
        return session
    }
    const clientManagement: ClientManagement = {                //Client Management object which is used to manage the client for the context
        setTheme: (newTheme: Theme) => {
            theme.value = newTheme
        },
        logIn: () => {
            getSession().logIn()
        },
        logOut: () => {
            getSession().logOut()
        }
    }
    
    //react hooks
    useEffect(() => {
        void getSession().initSession(userStore)                     //Init Session with current user stored in web browser
    }, []);

    return (
        <UserContext.Provider value={getSession().user.value}>
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