import ReactDOM from 'react-dom/client';
import 'main.css';
import TicTacToe from 'tictactoe/tictactoe';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <TicTacToe />
);
