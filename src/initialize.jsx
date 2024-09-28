import React from 'react';
import Chat from './chat';
import { createRoot } from 'react-dom/client';

export function initializeChatbot() {
  const chatbotScript = document.querySelector('script[data-askthing-bot]');

  if (!chatbotScript) {
    console.error('Chatbot script not found');
    return;
  }

  let config = {};
  const configAttr = chatbotScript.getAttribute('data-askthing-config');
  if (configAttr) {
    try {
      config = JSON.parse(configAttr);
    } catch (e) {
      console.error('Invalid chatbot configuration:', e);
    }
  }

  const chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'askthing-root';
  document.body.appendChild(chatbotContainer);

  const root = createRoot(chatbotContainer);
  root.render(<Chat config={config} />);
}
