import { lazy, useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { IconX, IconMessageDots } from "@tabler/icons-react";
import { Badge } from "./components/ui/badge";

const LazyChatWindow = lazy(() => import("./chat-window"));

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
    // userIcon: "https://cdn.askth.ing/user.png",
    // botIcon: "https://cdn.askth.ing/robot-face.png",
    ...props.config,
  };

  const [open, setOpen] = useState(false);
  const [showMessageBadge, setShowMessageBadge] = useState(false);
  const lighterPrimaryColor = lightenColor(config.primaryColor, 20);
  const initialMessageExists =
    config.initialMessages.length > 0 && config.initialMessages[0].content !== "";
  const storagePrefix = "askthing-DTUlLMYs4kab8AUFSGeF5ln3";

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

  function toggleOpen() {
    sessionStorage.setItem(`${storagePrefix}-hide-popup`, "true");
    setOpen(!open);
  }

  useEffect(() => {
    function showPopup() {
      return sessionStorage.getItem(`${storagePrefix}-hide-popup`) === null;
    }

    const savedMessages = localStorage.getItem(`${storagePrefix}-messages`);
    const parsedMessages = savedMessages
      ? JSON.parse(savedMessages)
      : config.initialMessages;

    const onlyInitialMessage = parsedMessages.length === 1 && initialMessageExists;

    if (!open && onlyInitialMessage && showPopup()) {
      setTimeout(() => {
        if (showPopup()) {
          setShowMessageBadge(true);
        }
      }, 3000);
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
              setShowMessageBadge(false);
            }}
          >
            <IconX size={14} />
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
        {open ? <IconX size="50" /> : <IconMessageDots size="50" className="rotate-6" />}
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
