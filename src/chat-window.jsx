import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconMessage2Plus,
  IconX,
  IconSend,
  IconPlayerStopFilled,
} from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { createId } from "@paralleldrive/cuid2";
import { evaluate } from "@mdx-js/mdx";
import { MDXProvider } from "@mdx-js/react";
import * as runtime from "react/jsx-runtime";
import PoweredByBadge from "./powered-by-badge";

async function mdxToHtml(mdxString) {
  const { default: Content } = await evaluate(mdxString, {
    MDXProvider: MDXProvider,
    ...runtime,
  });

  return <Content />;
}

function scrollToBottom(ref) {
  ref.current.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
}

const UserMessage = memo(({ message, config, lighterPrimaryColor }) => (
  <div className="flex gap-3 justify-end">
    <div
      className="rounded-xl bg-muted p-3 text-sm break-words max-w-[70%] rounded-tr-sm"
      style={{
        wordBreak: "break-word",
        background: `linear-gradient(to right, ${config.primaryColor}, ${lighterPrimaryColor})`,
        color: config.userColorForeground,
      }}
    >
      {message.component}
    </div>
    <Avatar className="h-8 w-8">
      <AvatarImage src={config.userIcon} />
      <AvatarFallback
        style={{
          background: `linear-gradient(to right, ${config.primaryColor}, ${lighterPrimaryColor})`,
        }}
      >
        {config.userInitials}
      </AvatarFallback>
    </Avatar>
  </div>
));

const AssistantAvatar = ({ size, config }) => (
  <Avatar
    style={{
      width: `${size}rem`,
      height: `${size}rem`,
    }}
  >
    <AvatarImage src={config.botIcon} />
    <AvatarFallback
      style={{
        backgroundColor: config.botColor,
        color: config.botColorForeground,
      }}
    >
      {config.botInitials}
    </AvatarFallback>
  </Avatar>
);

const AssistantMessage = memo(({ message, pulse, config }) => (
  <div className="flex items-start gap-3">
    <AssistantAvatar size={2} config={config} />
    <span
      className={cn(
        "rounded-xl rounded-tl-sm p-3 text-sm break-words max-w-[70%]",
        pulse && "animate-pulse"
      )}
      style={{
        wordBreak: "break-word",
        backgroundColor: config.botColor,
        color: config.botColorForeground,
      }}
    >
      {message.component || message.content}
    </span>
  </div>
));

const ChatWindow = (props) => {
  const config = props.config;
  const lighterPrimaryColor = props.lighterPrimaryColor;
  const storagePrefix = props.storagePrefix;
  const initialMessageExists = props.initialMessageExists;
  const setOpen = props.setOpen;
  const chatContainerRef = useRef(null);
  const footerRef = useRef(null);
  const [parsedMessages, setParsedMessages] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);
  const [showPulse, setShowPulse] = useState(false);

  const {
    messages,
    setMessages,
    isLoading,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    error,
  } = useChat({
    api: `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
    keepLastMessageOnError: true,
    onFinish(message) {
      appendToLocalStorage(message);
    },
  });

  const appendToLocalStorage = useCallback((message) => {
    const savedMessages = JSON.parse(
      localStorage.getItem(`${storagePrefix}-messages`) ?? "[]"
    );

    if (message.id === savedMessages[savedMessages.length - 1]?.id) {
      return;
    }

    localStorage.setItem(
      `${storagePrefix}-messages`,
      JSON.stringify([...savedMessages, message])
    );
  }, [storagePrefix]);

  const customSubmit = useCallback((e) => {
    if (error !== undefined) {
      setMessages(messages.slice(0, -1));
    }

    handleSubmit(e, {
      body: {
        apiKey: config.apiKey,
        conversationId: localStorage.getItem(`${storagePrefix}-chat-id`),
      },
    });
  }, [error, messages, handleSubmit, config.apiKey, storagePrefix]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      customSubmit(e);
    }
  }, [customSubmit]);

  const parseAndAddMessage = useCallback(async (message) => {
    const parsedMessage = await mdxToHtml(message.content);
    setParsedMessages((prev) => [
      ...prev,
      {
        ...message,
        component: parsedMessage,
      },
    ]);
  }, []);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowPulse(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowPulse(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    // Iterate through all messages
    const handleMessages = async () => {
      messages.forEach(async (message, index) => {
        const alreadyParsed = parsedMessages.find((m) => m.id === message.id);

        if (alreadyParsed) return;

        const isLastMessage = index === messages.length - 1;

        if (isLastMessage) {
          // Handle the latest message
          if (isLoading && message.role === "assistant") {
            // Message is still streaming
            setLatestMessage(message);
          } else {
            // Message has finished streaming; parse and add to parsedMessages
            await parseAndAddMessage(message);
            setLatestMessage(null);
          }
        } else {
          // Handle previous messages
          await parseAndAddMessage(message);
        }
      });
    };

    handleMessages();
  }, [messages, isLoading]);

  useEffect(() => {
    // Scroll to bottom when assistant is typing
    if (chatContainerRef.current && isLoading) {
      scrollToBottom(chatContainerRef);
    }
  }, [isLoading, showPulse, messages, parsedMessages, latestMessage]);

  useEffect(() => {
    // Scroll to bottom when chat is opened
    if (open) {
      scrollToBottom(chatContainerRef);
    }
  }, [open]);

  useEffect(() => {
    const noSavedMessages = localStorage.getItem(`${storagePrefix}-messages`) === null;

    // Save initial messages to local storage
    if (initialMessageExists && noSavedMessages) {
      appendToLocalStorage(config.initialMessages[0]);
    }
  }, [config.initialMessages]);

  useEffect(() => {
    // Create chat-id if not exists
    if (localStorage.getItem(`${storagePrefix}-chat-id`) === null) {
      localStorage.setItem(`${storagePrefix}-chat-id`, createId());
    }

    // Append user message to local storage
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      appendToLocalStorage(lastMessage);
      return;
    }

    // Load messages from local storage
    const savedMessages = JSON.parse(localStorage.getItem(`${storagePrefix}-messages`) || "[]");
    const parsedMessages = savedMessages.length > 0 ? savedMessages : config.initialMessages;
    if (messages.length === 0 && parsedMessages.length > 0) {
      setMessages(parsedMessages);
    }
  }, [messages.length, config.initialMessages]);

  return (
    <Card
      className={cn(
        "fixed flex flex-col w-svw h-dvh sm:h-auto sm:w-96 inset-0 sm:inset-auto bg-transparent sm:right-8 sm:bottom-28 rounded-none sm:rounded-2xl shadow-lg z-[110] transition-all duration-300",
        open && "slide-in"
      )}
    >
      <CardHeader
        className="relative flex-row gap-2 p-4 sm:rounded-t-2xl"
        style={{
          background: `linear-gradient(to right, ${config.primaryColor}, ${lighterPrimaryColor})`,
          color: config.primaryColorForeground,
        }}
      >
        <div className="flex flex-col flex-1 justify-between">
          <div className="flex gap-1 justify-end">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    className="inline-flex items-center justify-center size-8 p-2 hover:bg-transparent"
                    variant="ghost"
                    onClick={() => {
                      localStorage.removeItem(`${storagePrefix}-chat-id`);
                      localStorage.removeItem(`${storagePrefix}-messages`);
                      setMessages([]);
                      setParsedMessages([]);
                    }}
                  >
                    <IconMessage2Plus size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              className="inline-flex items-center justify-center size-8 p-2 hover:bg-transparent"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              <IconX size={18} />
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <AssistantAvatar size={2.5} config={config} />
            <div className="flex flex-col gap-1 justify-center">
              <div className="font-medium">{config.title}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                <span className="opacity-70">Online</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <ScrollArea
        className="flex-1 sm:flex-none sm:h-[calc(100svh-24rem)] hxl:h-[400px] bg-white"
        thumbStyle={{ backgroundColor: "#e5e5e5" }}
      >
        <CardContent className="p-4 grid gap-4" ref={chatContainerRef}>
          {error ? (
            <div className="w-full p-4 text-center border border-destructive text-destructive rounded-md">
              <p>{error.message}</p>
            </div>
          ) : (
            parsedMessages
              .map((message) =>
                message.role === "user" ? (
                  <UserMessage
                    key={message.id}
                    message={message}
                    config={config}
                    lighterPrimaryColor={lighterPrimaryColor}
                  />
                ) : (
                  <AssistantMessage key={message.id} message={message} config={config} />
                )
              )
          )}
          {latestMessage && latestMessage.role === "assistant" && latestMessage.content !== "" ? (
            <AssistantMessage message={latestMessage} config={config} />
          ) : (
            showPulse &&
            <AssistantMessage message={{ content: "..." }} config={config} pulse />
          )}
        </CardContent>
      </ScrollArea>
      <CardFooter
        ref={footerRef}
        className="flex flex-col p-4 gap-2 sm:rounded-b-2xl border-t border-t-gray-100 bg-white"
      >
        <form className="relative w-full" onSubmit={customSubmit} onKeyDown={onKeyDown}>
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onFocus={() => scrollToBottom(footerRef)}
            className="h-16 min-h-0 w-full resize-none rounded-xl px-4 pr-16 shadow-sm scroll bg-gray-100 border-gray-300 text-black"
          />
          <Button
            type={isLoading ? "button" : "submit"}
            size="icon"
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={
              isLoading
                ? stop
                : () => {
                    return;
                  }
            }
            style={{
              background: `linear-gradient(to right, ${config.primaryColor}, ${lighterPrimaryColor})`,
              color: config.primaryColorForeground,
            }}
          >
            {isLoading ? (
              <IconPlayerStopFilled className="h-4 w-4" />
            ) : (
              <IconSend className="h-4 w-4" />
            )}
            <span className="sr-only">{isLoading ? "Stop" : "Send"}</span>
          </Button>
        </form>
              <PoweredByBadge />
      </CardFooter>
    </Card>
  );
};

export default ChatWindow;
