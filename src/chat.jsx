import React from "react";
import { useChat } from "ai/react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconMessage2Plus,
  IconX,
  IconMessageDots,
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
import * as provider from "@mdx-js/react";
import * as runtime from "react/jsx-runtime";

const Chat = (props) => {
  const config = {
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

  const chatContainerRef = React.useRef(null);
  const footerRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [parsedMessages, setParsedMessages] = React.useState([]);
  const [latestMessage, setLatestMessage] = React.useState(null);
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
    api: `${process.env.BACKEND_URL}/api/chat`,
    keepLastMessageOnError: true,
    onFinish(message) {
      appendToLocalStorage(message);
    },
  });

  const lighterPrimaryColor = lightenColor(config.primaryColor, 20);

  function appendToLocalStorage(message) {
    const savedMessages = JSON.parse(localStorage.getItem("messages") ?? "[]");

    if (message.id === savedMessages[savedMessages.length - 1]?.id) {
      return;
    }

    localStorage.setItem(
      "messages",
      JSON.stringify([...savedMessages, message])
    );
  }

  function customSubmit(e) {
    if (error !== undefined) {
      setMessages(messages.slice(0, -1));
    }

    handleSubmit(e, {
      body: {
        apiKey: config.apiKey,
        conversationId: localStorage.getItem("chatId"),
      },
    });
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      customSubmit(e);
    }
  };

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

  async function mdxToHtml(mdxString) {
    const { default: Content } = await evaluate(mdxString, {
      ...provider,
      ...runtime,
    });

    return <Content />;
  }

  async function parseAndAddMessage(message) {
    const parsedMessage = await mdxToHtml(message.content);
    setParsedMessages((prev) => [
      ...prev,
      {
        ...message,
        component: parsedMessage,
      },
    ]);
  }

  function scrollToBottom(ref) {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }

  React.useEffect(() => {
    if (!messages || messages.length === 0) return;
    // Iterate through all messages
    const handleMessages = async () => {
      messages.forEach(async (message, index) => {
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
          const alreadyParsed = parsedMessages.find((m) => m.id === message.id);
          if (!alreadyParsed) {
            await parseAndAddMessage(message);
          }
        }
      });
    };

    handleMessages();
  }, [messages, isLoading]);

  React.useEffect(() => {
    // Scroll to bottom when assistant is typing
    if (chatContainerRef.current && isLoading) {
      scrollToBottom(chatContainerRef);
    }
  }, [isLoading, messages, parsedMessages, latestMessage]);

  React.useEffect(() => {
    // Scroll to bottom when chat is opened
    if (open) {
      scrollToBottom(chatContainerRef);
    }
  }, [open]);

  React.useEffect(() => {
    // Create chatId if not exists
    if (localStorage.getItem("chatId") === null) {
      const id = createId();
      localStorage.setItem("chatId", id);
    }

    // Append user message to local storage
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      appendToLocalStorage(lastMessage);
    }

    // Load messages from local storage
    const savedMessages = JSON.parse(localStorage.getItem("messages") ?? "[]");
    if (messages.length === 0 && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, [messages.length]);

  const UserMessage = ({ message }) => (
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
  );

  const AssistantAvatar = ({ size }) => (
    <Avatar style={{
      width: `${size}rem`,
      height: `${size}rem`,
    }}>
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

  const AssistantMessage = ({ message, pulse }) => (
    <div className="flex items-start gap-3">
      <AssistantAvatar size={2} />
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
  );

  return (
    <div className="fixed flex flex-col items-end gap-4 z-[100]">
      {open ? (
        <Card
          className={cn(
            "fixed flex flex-col w-svw h-svh sm:h-auto sm:w-96 right-0 bottom-0 bg-transparent sm:right-8 sm:bottom-28 rounded-none sm:rounded-2xl shadow-lg z-[110]",
            open ? "slide-in" : "slide-out"
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
                          localStorage.removeItem("chatId");
                          localStorage.removeItem("messages");
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
                <AssistantAvatar size={2.5} />
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
                  .filter((message) => !message.toolInvocations)
                  .map((message) => (
                    <>
                      {message.role === "user" ? (
                        <UserMessage key={message.id} message={message} />
                      ) : (
                        <AssistantMessage key={message.id} message={message} />
                      )}
                    </>
                  ))
              )}
              {latestMessage && latestMessage.role === "assistant" ? (
                <AssistantMessage message={latestMessage} />
              ) : null}
              {isLoading && latestMessage === null ? (
                <AssistantMessage message={{ content: "..." }} pulse />
              ) : null}
            </CardContent>
          </ScrollArea>
          <CardFooter
            ref={footerRef}
            className="flex flex-col p-4 gap-2 sm:rounded-b-2xl border-t border-t-gray-100 bg-white"
          >
            <form
              className="relative w-full"
              onSubmit={customSubmit}
              onKeyDown={onKeyDown}
            >
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
                onClick={isLoading ? stop : () => {}}
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
            <div className="flex items-center gap-2 text-sm text-black">
              <p>Powered by</p>
              <a
                href="https://askth.ing"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <img
                  src="https://cdn.askth.ing/icon.png"
                  alt="AskThing"
                  width={20}
                  height={20}
                />
                <p>AskThing</p>
              </a>
            </div>
          </CardFooter>
        </Card>
      ) : null}
      <Button
        className="fixed w-16 h-16 rounded-full border-none text-text p-3 right-4 bottom-4 sm:right-8 sm:bottom-8 shadow-sm"
        style={{
          background: `linear-gradient(to right, ${config.primaryColor}, ${lighterPrimaryColor})`,
          color: config.primaryColorForeground,
        }}
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <IconX size="50" />
        ) : (
          <IconMessageDots size="50" className="rotate-6" />
        )}
      </Button>
    </div>
  );
};

export default Chat;
