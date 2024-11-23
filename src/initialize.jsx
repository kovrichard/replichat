import { lazy } from "react";
import { createRoot } from "react-dom/client";

const LazyChat = lazy(() => import("./chat"));

export async function initializeChatbot() {
  const config = await getConfig();
  await createShadowRoot(config);
}

async function getConfig() {
  var chatbotScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

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
    `${import.meta.env.VITE_BACKEND_URL}/api/bot/${apiKey}/config`
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

async function createShadowRoot(config) {
  const host = document.createElement("div");
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  const response = await fetch(`${import.meta.env.VITE_CDN_URL}/style.css`);
  const body = await response.text();

  const style = document.createElement("style");
  style.textContent = body;
  shadowRoot.appendChild(style);

  const chatbotContainer = document.createElement("div");
  chatbotContainer.id = "askthing-root";
  shadowRoot.appendChild(chatbotContainer);

  const root = createRoot(chatbotContainer);
  root.render(<LazyChat config={config} />);
}
