import React from 'react';
import Chat from './chat';
import { createRoot } from 'react-dom/client';

export function initializeChatbot() {
  const chatbotScript = document.querySelector('script[data-replichat-bot]');

  if (!chatbotScript) {
    console.error('Chatbot script not found');
    return;
  }

  let config = {};
  const configAttr = chatbotScript.getAttribute('data-replichat-config');
  if (configAttr) {
    try {
      config = JSON.parse(configAttr);
    } catch (e) {
      console.error('Invalid chatbot configuration:', e);
    }
  }

  const chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'replichat-root';
  document.body.appendChild(chatbotContainer);

  const root = createRoot(chatbotContainer);
  root.render(<Chat config={config} />);
}