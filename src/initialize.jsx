import React from "react";
import Chat from "./chat";
import { createRoot } from "react-dom/client";

export async function initializeChatbot() {
  const config = await getConfig();
  createBotRoot(config);
}

async function getConfig() {
  const chatbotScript = document.querySelector("script[data-askthing-bot]");

  if (!chatbotScript) {
    console.error("AskThing script not found");
    return;
  }

  const apiKey = chatbotScript.getAttribute("data-askthing-api-key");

  if (!apiKey) {
    console.error("AskThing API key not found");
    return;
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/bot/${apiKey}/config`
  );

  if (!response.ok) {
    console.error("Failed to fetch AskThing configuration");
    return;
  }

  const config = await response.json();

  return {
    ...config,
    apiKey,
  };
}

function createBotRoot(config) {
  const chatbotContainer = document.createElement("div");
  chatbotContainer.id = "askthing-root";
  document.body.appendChild(chatbotContainer);

  const root = createRoot(chatbotContainer);
  root.render(<Chat config={config} />);
}
