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
    assistantInitials: "AI",
    primaryColor: "#2d3250",
    userColor: "#F9b17a",
    botColor: "#6f9ceb",
    primaryColorForeground: "#FFFFFF",
    userColorForeground: "#000000",
    botColorForeground: "#000000",
    //userIcon: "https://chat.richardkovacs.dev/profile.svg",
    //botIcon: "https://chat.richardkovacs.dev/richard-kovacs.webp",
    ...props.config,
  };

  const chatContainerRef = React.useRef(null);
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

    // Scroll to bottom when assistant is typing
    if (chatContainerRef.current && isLoading) {
      chatContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages, isLoading]);

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

  return (
    <div className="fixed flex flex-col items-end gap-4 z-[100]">
      {open ? (
        <Card
          className={cn(
            "fixed flex flex-col w-svw h-svh sm:h-auto sm:w-96 right-0 bottom-0 sm:right-8 sm:bottom-28 rounded-none sm:rounded-2xl shadow-lg bg-[#6f9ceb] transition-transform duration-300 z-[110]",
            open ? "slide-in" : "slide-out"
          )}
        >
          <CardHeader className="relative justify-center flex-row gap-2 p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="absolute z-10 -right-[2px] -top-[2px]">
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={config.botIcon} />
                  <AvatarFallback>{config.assistantInitials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="font-medium text-black">{config.title}</div>
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger
                    className="absolute right-3 bottom-3 bg-[#7a82f9]"
                    asChild
                  >
                    <Button
                      size="icon"
                      style={{
                        backgroundColor: config.primaryColor,
                        color: config.primaryColorForeground,
                      }}
                      onClick={() => {
                        localStorage.removeItem("chatId");
                        localStorage.removeItem("messages");
                        setMessages([]);
                        setParsedMessages([]);
                      }}
                    >
                      <IconMessage2Plus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New conversation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-1 sm:hidden"
              >
                <IconX className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 sm:flex-none sm:h-[calc(100svh-24rem)] hxl:h-[400px] bg-[#2d3250]">
            <CardContent className="p-4 grid gap-4" ref={chatContainerRef}>
              {error ? (
                <div className="w-full p-4 text-center border border-destructive text-destructive rounded-md">
                  <p>{error.message}</p>
                </div>
              ) : (
                parsedMessages
                  .filter((message) => !message.toolInvocations)
                  .map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-3",
                        message.role === "user" ? "justify-end" : ""
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={config.botIcon} />
                          <AvatarFallback>
                            {config.assistantInitials}
                          </AvatarFallback>
                        </Avatar>
                      ) : null}
                      <div
                        className={cn(
                          "rounded-xl bg-muted p-3 text-sm break-words max-w-[70%]",
                          message.role === "user"
                            ? "rounded-tr-sm"
                            : "rounded-tl-sm"
                        )}
                        style={{
                          wordBreak: "break-word",
                          backgroundColor:
                            message.role === "user"
                              ? config.userColor
                              : config.botColor,
                          color:
                            message.role === "user"
                              ? config.userColorForeground
                              : config.botColorForeground,
                        }}
                      >
                        {message.component}
                      </div>
                      {message.role === "user" ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={config.userIcon} />
                          <AvatarFallback>{config.userInitials}</AvatarFallback>
                        </Avatar>
                      ) : null}
                    </div>
                  ))
              )}
              {latestMessage && latestMessage.role === "assistant" ? (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={config.botIcon} />
                    <AvatarFallback>{config.assistantInitials}</AvatarFallback>
                  </Avatar>
                  <div
                    className="rounded-xl rounded-tl-sm p-3 text-sm break-words max-w-[70%]"
                    style={{
                      wordBreak: "break-word",
                      backgroundColor: config.botColor,
                      color: config.botColorForeground,
                    }}
                  >
                    {latestMessage.content}
                  </div>
                </div>
              ) : null}
              {isLoading && messages[messages.length - 1]?.role === "user" ? (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={config.botIcon} />
                    <AvatarFallback>{config.assistantInitials}</AvatarFallback>
                  </Avatar>
                  <span
                    className="rounded-xl rounded-tl-sm p-3 text-sm animate-pulse"
                    style={{
                      backgroundColor: config.botColor,
                      color: config.botColorForeground,
                    }}
                  >
                    ...
                  </span>
                </div>
              ) : null}
            </CardContent>
          </ScrollArea>
          <CardFooter className="flex flex-col p-4 gap-2 bg-[#2d3250] sm:rounded-b-2xl border-t">
            <form
              className="relative w-full"
              onSubmit={customSubmit}
              onKeyDown={onKeyDown}
            >
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                className="h-16 min-h-0 w-full resize-none rounded-xl px-4 pr-16 shadow-sm scroll bg-[#161e31]"
              />
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={stop}
                  style={{
                    backgroundColor: config.primaryColor,
                    color: config.primaryColorForeground,
                  }}
                >
                  <IconPlayerStopFilled className="h-4 w-4" />
                  <span className="sr-only">Stop</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  style={{
                    backgroundColor: config.primaryColor,
                    color: config.primaryColorForeground,
                  }}
                >
                  <IconSend className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              )}
            </form>
            <div className="flex items-center gap-2 text-sm text-white">
              <p>Powered by</p>
              <a
                href="https://askth.ing"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <img
                  src="https://cdn.askth.ing/icon.png"
                  alt="askthing"
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
        className="fixed w-16 h-16 rounded-full border-none text-text p-3 right-4 bottom-4 sm:right-8 sm:bottom-8 shadow-sm bg-[#6f9ceb] hover:bg-[rgba(111,156,235,0.8)]"
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
