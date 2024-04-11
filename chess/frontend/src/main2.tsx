/*
import ReactDOM from 'react-dom/client';
import 'main.css';
import Chess from 'chess/chess';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isMobile } from 'react-device-detect';
import { TouchBackend } from 'react-dnd-touch-backend';
import { usePreview } from 'react-dnd-preview';
import { Piece } from 'chess/lib/constants/ChessConstants';
import PieceDragPreview from 'chess/components/PieceDragPreview';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

//In html5backend is a drag preview implemented by default, but in touchbackend it is not, so its now implemented manually here
const MobilePreview = () => {
  const preview = usePreview();
  if (!preview.display) {
    return null;
  }
  const { item, style } = preview;
  const piece = item as Piece
  return <PieceDragPreview piece={piece} style={style} />
}

//differentiate between mobile (touch) and desktop (html5) devices
const chess = isMobile ?
  <DndProvider backend={TouchBackend}>
    <Chess />
    <MobilePreview />
  </DndProvider>
  :
  <DndProvider backend={HTML5Backend}>
    <Chess />
  </DndProvider>

root.render(
  chess
);
*/