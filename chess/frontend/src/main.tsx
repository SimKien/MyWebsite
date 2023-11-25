import ReactDOM from 'react-dom/client';
import 'main.css';
import Chess from 'chess/chess';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isMobile } from 'react-device-detect';
import { TouchBackend } from 'react-dnd-touch-backend';
import { usePreview } from 'react-dnd-preview';
import { Piece } from 'chess/lib/constants/ChessConstants';

import "chess/style/Piece.css"
import { PIECE_MAP } from 'chess/components/Piece';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const MobilePreview = () => {
  const preview = usePreview();
  if (!preview.display) {
    return null;
  }
  const { item, style } = preview;
  const piece = item as Piece
  return <div style={{ ...style }}>{PIECE_MAP[piece.type](piece.color, "1.0")}</div>
}

let chess = isMobile ?
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