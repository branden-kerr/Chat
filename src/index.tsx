import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globalStyles.css';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);