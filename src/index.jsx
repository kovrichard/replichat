import '@/styles/globals.css';
import React from 'react';
import Chat from './chat';
import { createRoot } from 'react-dom/client';
import { initializeChatbot } from './initialize';

const config = {
    hello: 'world',
};

if (process.env.NODE_ENV === 'development') {
    const domNode = document.getElementById('root');
    const root = createRoot(domNode);
    root.render(<Chat config={config} />);
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChatbot);
    } else {
        initializeChatbot();
    }
}
