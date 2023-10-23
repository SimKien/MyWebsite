import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import Test from "./pages/test/test";
import Startpage from './pages/start/startpage';
import TicTacToe from './pages/tictactoe/tictactoe';
import Chess from './pages/chess/chess';
import { BrowserRouter, Routes, Route} from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Startpage />} />
        <Route path='/test' element={<Test />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/chess" element={<Chess />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
