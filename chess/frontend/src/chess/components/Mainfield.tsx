import { signal } from "@preact/signals-react";
import { FieldPages } from "chess/lib/FieldPages";
import "chess/style/MainField.css"
import MultiplayerGame from "chess/components/pages/multiplayergame/MultiplayerGame";
import { useRef } from "react";
import StartPage from "chess/components/pages/startpage/StartPage";

const selection = signal<FieldPages>(FieldPages.Start);                               //Signal for the chosen game or other pages presented in the main field

export const setSelection = (newSelection: FieldPages) => {
    selection.value = newSelection
}

const generateSelectedPage = () => {                                                            //generates the current selected page or error page
    switch (selection.value) {
        case FieldPages.MultiplayerGame:
            return MultiplayerGame()
        case FieldPages.Start:
            return StartPage()
        default:
            console.error("Selected Page is not available");
            return <div><p>Failed to load Page</p></div>
    }
}

export default function MainField() {
    const lastPageSelected = useRef<FieldPages>(FieldPages.Start)

    const currentPage = useRef<JSX.Element>(StartPage());

    if (lastPageSelected.current != selection.value) {                                   //if no other page selected stay on current page
        lastPageSelected.current = selection.value
        currentPage.current = generateSelectedPage()
    }

    return (
        <div className="MainField_main">
            {currentPage.current}
        </div>
    );
}