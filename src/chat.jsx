import MessageDots from "@/components/icons/message-dots";
import X from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { Suspense, lazy, useEffect, useState } from "react";
import { Badge } from "./components/ui/badge";

const LazyChatWindow = lazy(() => import("./chat-window"));

const storagePrefix = "remiq-DTUlLMYs4kab8AUFSGeF5ln3";

function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    B = ((num >> 8) & 0x00ff) + amt,
    G = (num & 0x0000ff) + amt;

  const newColor = (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
    (G < 255 ? (G < 1 ? 0 : G) : 255)
  )
    .toString(16)
    .slice(1);

  return `#${newColor}`;
}

function showPopup() {
  return sessionStorage.getItem(`${storagePrefix}-hide-popup`) === null;
}

async function sendToBackend(method, payload) {
  const chatId = localStorage.getItem(`${storagePrefix}-chat-id`);

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Failed to send message to backend");
  }

  return response.json();
}

const Chat = (props) => {
  const config = {
    initialMessages: [],
    title: "AI Assistant",
    userInitials: "US",
    botInitials: "AI",
    primaryColor: "#143aa2",
    primaryColorForeground: "#FFFFFF",
    botColor: "#e5e5e5",
    botColorForeground: "#000000",
    // userIcon: `${import.meta.env.VITE_CDN_URL}/chat-window/user.png`,
    // botIcon: `${import.meta.env.VITE_CDN_URL}/chat-window/robot-face.png`,
    ...props.config,
  };

  const [open, setOpen] = useState(false);
  const [showMessageBadge, setShowMessageBadge] = useState(false);
  const lighterPrimaryColor = lightenColor(config.primaryColor, 20);
  const initialMessageExists =
    config.initialMessages.length > 0 && config.initialMessages[0].content !== "";

  async function saveInstantOpen() {
    await sendToBackend("POST", {
      instantOpen: true,
      openCount: 1,
      apiKey: config.apiKey,
    });
  }

  async function saveInstantClose() {
    await sendToBackend("POST", {
      instantClose: true,
      apiKey: config.apiKey,
    });
  }

  async function incrementOpenCount() {
    await sendToBackend("PUT", {
      open: true,
      apiKey: config.apiKey,
    });
  }

  function toggleOpen() {
    sessionStorage.setItem(`${storagePrefix}-hide-popup`, "true");

    if (!open) {
      const openCount =
        parseInt(sessionStorage.getItem(`${storagePrefix}-open-count`)) || 0;
      const instantClose = sessionStorage.getItem(`${storagePrefix}-instant-close`);

      if (openCount === 0 && instantClose === null && initialMessageExists) {
        sessionStorage.setItem(`${storagePrefix}-instant-open`, "true");
        saveInstantOpen();
      } else {
        incrementOpenCount();
      }
      sessionStorage.setItem(`${storagePrefix}-open-count`, openCount + 1);
    }

    setOpen(!open);
  }

  useEffect(() => {
    // Create chat-id if not exists
    if (localStorage.getItem(`${storagePrefix}-chat-id`) === null) {
      localStorage.setItem(`${storagePrefix}-chat-id`, createId());
    }

    // Load messages from storage or fallback to initial messages
    const savedMessages = JSON.parse(
      localStorage.getItem(`${storagePrefix}-messages`) || "[]"
    );
    const parsedMessages =
      savedMessages.length > 0 ? savedMessages : config.initialMessages;

    const onlyInitialMessage = parsedMessages.length === 1 && initialMessageExists;

    if (!open && onlyInitialMessage && showPopup()) {
      setTimeout(() => showPopup() && setShowMessageBadge(true), 3000);
    } else {
      setShowMessageBadge(false);
    }
  }, [open, config.initialMessages]);

  return (
    <div className="fixed flex flex-col items-end gap-4 z-[100]">
      {open && (
        <Suspense fallback={null}>
          <LazyChatWindow
            config={config}
            lighterPrimaryColor={lighterPrimaryColor}
            storagePrefix={storagePrefix}
            initialMessageExists={initialMessageExists}
            setOpen={setOpen}
          />
        </Suspense>
      )}
      {showMessageBadge && initialMessageExists && (
        <div
          className="fixed right-4 bottom-24 sm:right-8 sm:bottom-28 inline-flex items-center justify-center text-sm text-pretty break-words max-w-64 p-4 rounded-2xl rounded-br-md text-white slide-in opacity-0"
          style={{
            wordBreak: "break-word",
            background: `linear-gradient(to right, ${config.primaryColor}, ${lighterPrimaryColor})`,
          }}
        >
          <p>{config.initialMessages[0].content}</p>
          <Button
            className="absolute -top-2 -right-2 rounded-full size-5 p-1 border-none hover:scale-105 transition-transform duration-200"
            aria-label="Close"
            style={{
              backgroundColor: config.primaryColor,
              color: config.primaryColorForeground,
            }}
            variant="outline"
            onClick={() => {
              sessionStorage.setItem(`${storagePrefix}-hide-popup`, "true");
              sessionStorage.setItem(`${storagePrefix}-instant-close`, "true");
              saveInstantClose();
              setShowMessageBadge(false);
            }}
          >
            <X size={14} />
          </Button>
        </div>
      )}
      <Button
        className="fixed w-16 h-16 rounded-full border-none text-text p-3 right-4 bottom-4 sm:right-8 sm:bottom-8 shadow-sm hover:scale-105 transition-transform duration-200"
        style={{
          background: `linear-gradient(to right, ${config.primaryColor}, ${lighterPrimaryColor})`,
          color: config.primaryColorForeground,
        }}
        variant="outline"
        onClick={toggleOpen}
      >
        <p className="sr-only">{open ? "Close chat" : "Open chat"}</p>
        {open ? <X size="50" /> : <MessageDots size="50" className="rotate-6" />}
        {showMessageBadge && initialMessageExists && (
          <Badge className="absolute inline-flex items-center justify-center top-0 right-0 -mt-2 -mr-2 size-6 bg-[#D54B10] text-white hover:bg-[#D54B10]">
            1
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default Chat;
