import '@/styles/globals.css';
import React from 'react';
import Chat from './chat';
import { createRoot } from 'react-dom/client';
import { initializeChatbot } from './initialize';
import { createId } from '@paralleldrive/cuid2';

const config = {
    title: 'Test Assistant',
    initialMessages: [
        {
            id: createId(),
            role: "assistant",
            content: "Hello! How can I help you today?",
        },
    ],
};

if (process.env.NODE_ENV === 'development') {
    const domNode = document.getElementById('askthing-root');
    const root = createRoot(domNode);
    root.render(<Chat config={config} />);
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChatbot);
    } else {
        initializeChatbot();
    }
}
