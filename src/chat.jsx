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

const Chat = (props) => {
  const config = {
    title: "AI Assistant",
    userInitials: "US",
    assistantInitials: "AI",
    primaryColor: "#000000",
    userColor: "#F1F5F9",
    botColor: "#0F172A",
    primaryColorForeground: "#FFFFFF",
    userColorForeground: "#000000",
    botColorForeground: "#FFFFFF",
    //userIcon: "https://chat.richardkovacs.dev/profile.svg",
    //botIcon: "https://chat.richardkovacs.dev/richard-kovacs.webp",
    ...props.config,
  };

  const chatContainerRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
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
  });

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

  React.useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }

    if (localStorage.getItem("chatId") === null) {
      const id = createId();
      localStorage.setItem("chatId", id);
      localStorage.setItem("messages", JSON.stringify([]));
      setMessages([]);
    } else {
      setMessages(JSON.parse(localStorage.getItem("messages") ?? "[]"));
    }

    if (chatContainerRef.current && isLoading) {
      chatContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  return (
    <div className="fixed flex flex-col items-end gap-4 z-[100]">
      {open ? (
        <Card
          className={cn(
            "fixed flex flex-col w-svw h-svh sm:h-auto sm:w-96 right-0 bottom-0 sm:right-8 sm:bottom-28 rounded-none sm:rounded-2xl shadow-lg bg-[#FFFFFF] transition-transform duration-300 z-[110]",
            open ? "slide-in" : "slide-out"
          )}
        >
          <CardHeader className="relative justify-center flex-row gap-2 border-b p-4">
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
              <div className="font-medium">{config.title}</div>
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="absolute right-3 bottom-3" asChild>
                    <Button
                      size="icon"
                      style={{
                        backgroundColor: config.primaryColor,
                        color: config.primaryColorForeground,
                      }}
                      onClick={() => {
                        localStorage.removeItem("chatId");
                        setMessages([]);
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
          <ScrollArea className="flex-1 sm:flex-none sm:h-[calc(100svh-24rem)] hxl:h-[400px]">
            <CardContent className="p-4 grid gap-4" ref={chatContainerRef}>
              {error ? (
                <div className="w-full p-4 text-center border border-destructive text-destructive rounded-md">
                  <p>{error.message}</p>
                </div>
              ) : (
                messages
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
                        {message.content.split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
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
              {isLoading && messages[messages.length - 1].role === "user" ? (
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
          <CardFooter className="flex flex-col border-t p-4 gap-2">
            <form
              className="relative w-full"
              onSubmit={customSubmit}
              onKeyDown={onKeyDown}
            >
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                className="h-16 min-h-0 w-full resize-none rounded-xl border border-neutral-400 px-4 pr-16 shadow-sm scroll bg-[#FFFFFF]"
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
            <div className="flex items-center gap-2">
              <p>Powered by</p>
              <a
                href="https://askth.ing"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1"
              >
                <img
                  src="https://cdn.askth.ing/icon.png"
                  alt="askthing"
                  width={20}
                  height={20}
                />
                <p>askthing</p>
              </a>
            </div>
          </CardFooter>
        </Card>
      ) : null}
      <Button
        className="fixed w-16 h-16 rounded-full bg-background text-text p-3 right-4 bottom-4 sm:right-8 sm:bottom-8"
        variant="ghost"
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
