import "chess/style/navbar/Navbar.css"
import { FieldPages } from "chess/lib/FieldPages";
import { currentSelection } from "chess/components/Mainfield";
import { useContext } from "react";
import { ClientManagementContext } from "chess/lib/contexts/ClientManagementContext";

const currentOrigin = window.location.origin

export default function Navbar() {

    //context hooks
    const clientManagement = useContext(ClientManagementContext)

    // handlers
    const pageSelectionHandler = (page: FieldPages) => {
        if (page === currentSelection) return
        const newUrl = currentOrigin + "/" + page
        window.open(newUrl, "_self")
    }

    return (
        <div className="navbar_main">
            <div className="navbar_page_selection">
                <span className="navbar_item" onClick={() => pageSelectionHandler(FieldPages.Start)}>
                    <p>Home</p>
                </span>
                <span className="navbar_item" onClick={() => pageSelectionHandler(FieldPages.MultiplayerGame)}>
                    <p>Play</p>
                </span>
            </div>
            <div className="navbar_client_management">
                <span className="navbar_item" onClick={clientManagement.logIn}>
                    <p>Login</p>
                </span>
                <span className="navbar_item" onClick={clientManagement.logOut}>
                    <p>Logout</p>
                </span>
            </div>
        </div>
    );
}