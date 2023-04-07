import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './stateManagement/store';
import SocketService from './socketService';
import Router from './router';
import "./style.scss"


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StoreProvider>
      <Router/>
      <SocketService />
    </StoreProvider>
  </React.StrictMode>
);

