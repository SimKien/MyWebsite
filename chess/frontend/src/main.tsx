import ReactDOM from 'react-dom/client';
import 'main.css';
import Chess from 'chess/chess';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Chess />
);