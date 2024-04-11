import ReactDOM from 'react-dom/client';
import 'main.css';
import BasePartition from 'chess/BasePartition';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <BasePartition />
);