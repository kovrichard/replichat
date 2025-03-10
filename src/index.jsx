import { createId } from "@paralleldrive/cuid2";
import { lazy } from "react";
import { createRoot } from "react-dom/client";
import { initializeChatbot } from "./initialize";

const LazyChat = lazy(() => import("./chat"));

if (import.meta.env.MODE === "development") {
  import("@/styles/globals.css");
  const config = {
    title: "Test Assistant",
    initialMessages: [
      {
        id: createId(),
        role: "assistant",
        content: "Hello! How can I help you today?",
      },
    ],
    apiKey: import.meta.env.VITE_REMIQ_API_KEY,
  };

  const domNode = document.getElementById("remiq-root");
  const root = createRoot(domNode);
  root.render(<LazyChat config={config} />);
} else {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeChatbot);
  } else {
    initializeChatbot();
  }
}
