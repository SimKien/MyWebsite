import { FieldPages, getFieldPage } from "chess/lib/FieldPages";
import "chess/style/MainField.css"
import MultiplayerGame from "chess/components/pages/multiplayergame/MultiplayerGame";
import StartPage from "chess/components/pages/startpage/StartPage";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isMobile } from 'react-device-detect';
import { TouchBackend } from 'react-dnd-touch-backend';

//TODO: build a better way to get the current selected page e g in a seperated path util file
//TODO: implement DragPreview for touchbackend

const currentPath = window.location.pathname                                                    //gets the current path
export const currentSelection = getFieldPage(currentPath.split("/")[1])                         //gets and exports the current selected page in the url

const generateSelectedPage = () => {                                                            //generates the current selected page or error page
    switch (currentSelection) {
        case FieldPages.MultiplayerGame:
            return MultiplayerGame()
        case FieldPages.Start:
            return StartPage()
        default:
            console.error("Selected Page is not available");
            return <p>Failed to load Page</p>
    }
}

export default function MainField() {
    const currentPage = generateSelectedPage()

    return (
        <>
            {isMobile ?
                <DndProvider backend={TouchBackend}>
                    {currentPage}
                </DndProvider>
            :
                <DndProvider backend={HTML5Backend}>
                    {currentPage}
                </DndProvider>}
        </>
    );
}