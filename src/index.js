import '@/styles/globals.css';
import React from 'react';
import Chat from './chat';
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<Chat />);
