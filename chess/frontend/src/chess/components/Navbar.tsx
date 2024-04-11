import "chess/style/Navbar.css"
import { setSelection } from "chess/components/Mainfield";
import { FieldPages } from "chess/lib/FieldPages";

export default function Navbar() {
    setSelection(FieldPages.Start);

    return (
        <div className="Navbar_main">
            <p>Navbar</p>
        </div>
    );
}