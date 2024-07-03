import '@/styles/globals.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Chat from './chat';

(function() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  ReactDOM.render(<Chat />, container);
})();
