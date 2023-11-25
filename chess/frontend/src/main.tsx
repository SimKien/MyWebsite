import ReactDOM from 'react-dom/client';
import 'main.css';
import Chess from 'chess/chess';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isMobile } from 'react-device-detect';
import { TouchBackend } from 'react-dnd-touch-backend';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
let chess = isMobile ?
  <DndProvider backend={TouchBackend} >
    <Chess />
  </DndProvider >
  :
  <DndProvider backend={HTML5Backend}>
    <Chess />
  </DndProvider>

root.render(
  chess
);