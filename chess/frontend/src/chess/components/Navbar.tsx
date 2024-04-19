import "chess/style/Navbar.css"
import { FieldPages } from "chess/lib/FieldPages";
import { currentSelection } from "chess/components/Mainfield";

const currentOrigin = window.location.origin

export default function Navbar() {

    // handlers
    const selectionHandler = (page: FieldPages) => {
        if (page === currentSelection) return
        const newUrl = currentOrigin + "/" + page
        window.open(newUrl, "_self")
    }

    return (
        <div className="Navbar_main">
            <button className="Navbar_item" onClick={() => selectionHandler(FieldPages.Start)}>Home</button>
            <button className="Navbar_item" onClick={() => selectionHandler(FieldPages.MultiplayerGame)}>Play</button>
        </div>
    );
}