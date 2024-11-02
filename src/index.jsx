import React from 'react';
import Chat from './chat';
import { createRoot } from 'react-dom/client';
import { initializeChatbot } from './initialize';
import { createId } from '@paralleldrive/cuid2';

if (process.env.NODE_ENV === 'development') {
    import('@/styles/globals.css');
    const config = {
        title: 'Test Assistant',
        initialMessages: [
            {
                id: createId(),
                role: "assistant",
                content: "Hello! How can I help you today?",
            },
        ],
        apiKey: process.env.ASKTHING_API_KEY,
    };

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
