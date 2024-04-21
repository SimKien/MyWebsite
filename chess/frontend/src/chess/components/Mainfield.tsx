import { FieldPages, getFieldPage } from "chess/lib/FieldPages";
import "chess/style/MainField.css"
import MultiplayerGame from "chess/components/pages/multiplayergame/MultiplayerGame";
import StartPage from "chess/components/pages/startpage/StartPage";
import { DndProvider, TouchTransition, MouseTransition, usePreview } from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Piece } from "chess/lib/constants/BoardConstants";
import DragPreview from "chess/components/pages/multiplayergame/DragPreview";

//TODO: build a better way to get the current selected page e g in a seperated path util file
//TODO: implement DragPreview for touchbackend
// -> use react-router-dom to get the current path

const currentPath = window.location.pathname                                                    //gets the current path
export const currentSelection = getFieldPage(currentPath.split("/")[1])                         //gets and exports the current selected page in the url

//Touch and Mouse backend for drag and drop which distinguishes between touch and mouse events
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {enableMouseEvents: true},
      preview: true,
      transition: TouchTransition,
    },
  ],
}

//Preview for drag and drop on touch devices
const MyPreview = () => {
    const preview = usePreview()
    if (!preview.display) {
      return null
    }
    const {item, style} = preview;
    const piece = item as Piece
    return <DragPreview piece={piece} style={style} />
  }

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
        <DndProvider options={HTML5toTouch}>
            {currentPage}
            <MyPreview />
        </DndProvider>
    );
}