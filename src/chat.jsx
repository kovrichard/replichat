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
    userIcon: "https://chat.richardkovacs.dev/profile.svg",
    botIcon: "https://chat.richardkovacs.dev/richard-kovacs.webp",
    apiKey: "",
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
    api: process.env.BACKEND_URL,
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
    if (messages.length === 0) {
      const id = createId();
      localStorage.setItem("chatId", id);
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  return (
    <div className="replichat-fixed replichat-flex replichat-flex-col replichat-items-end replichat-right-10 replichat-bottom-10 replichat-gap-4">
      {open ? (
        <Card
          className={cn(
            "sm:replichat-w-96 replichat-rounded-2xl replichat-shadow-lg replichat-bg-background",
            open ? "slide-in" : "slide-out"
          )}
        >
          <CardHeader className="replichat-relative replichat-justify-center replichat-flex-row replichat-gap-2 replichat-border-b replichat-p-4">
            <div className="replichat-flex replichat-flex-col replichat-items-center replichat-gap-2">
              <div className="replichat-relative">
                <div className="replichat-absolute replichat-z-10 -replichat-right-[2px] -replichat-top-[2px]">
                  <span className="replichat-relative replichat-flex replichat-h-3 replichat-w-3">
                    <span className="replichat-animate-ping replichat-absolute replichat-inline-flex replichat-h-full replichat-w-full replichat-rounded-full replichat-bg-green-400 replichat-opacity-75"></span>
                    <span className="replichat-relative replichat-inline-flex replichat-rounded-full replichat-h-3 replichat-w-3 replichat-bg-green-500"></span>
                  </span>
                </div>
                <Avatar className="replichat-h-10 replichat-w-10">
                  <AvatarImage src={config.botIcon} />
                  <AvatarFallback>{config.assistantInitials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="replichat-font-medium">{config.title}</div>
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="replichat-absolute replichat-right-3 replichat-bottom-3" asChild>
                    <Button size="icon" onClick={() => setMessages([])}>
                      <IconMessage2Plus className="replichat-h-5 replichat-w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New conversation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <ScrollArea className="replichat-h-[400px]">
            <CardContent className="replichat-p-4 replichat-grid replichat-gap-4" ref={chatContainerRef}>
              {error ? (
                <div>
                  <p>{error.message}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "replichat-flex replichat-items-start replichat-gap-3",
                      message.role === "user" ? "replichat-justify-end" : ""
                    )}
                  >
                    {message.role !== "user" ? (
                      <Avatar className="replichat-h-8 replichat-w-8">
                        <AvatarImage src={config.botIcon} />
                        <AvatarFallback>
                          {config.assistantInitials}
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                    <div
                      className={cn(
                        "replichat-rounded-lg replichat-bg-muted replichat-p-3 replichat-text-sm",
                        message.role === "user"
                          ? ""
                          : "replichat-bg-primary replichat-text-primary-foreground"
                      )}
                    >
                      {message.content.split("\n").map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                    {message.role === "user" ? (
                      <Avatar className="replichat-h-8 replichat-w-8">
                        <AvatarImage src={config.userIcon} />
                        <AvatarFallback>{config.userInitials}</AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1].role === "user" ? (
                <div className="replichat-flex replichat-items-start replichat-gap-3">
                  <Avatar className="replichat-h-8 replichat-w-8">
                    <AvatarImage src={config.botIcon} />
                    <AvatarFallback>{config.assistantInitials}</AvatarFallback>
                  </Avatar>
                  <span className="replichat-rounded-lg replichat-bg-primary replichat-text-primary-foreground replichat-p-3 replichat-text-sm replichat-animate-pulse">
                    ...
                  </span>
                </div>
              ) : null}
            </CardContent>
          </ScrollArea>
          <CardFooter className="replichat-flex replichat-flex-col replichat-border-t replichat-p-4 replichat-gap-2">
            <form
              className="replichat-relative replichat-w-full"
              onSubmit={customSubmit}
              onKeyDown={onKeyDown}
            >
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                className="replichat-h-16 replichat-min-h-0 replichat-w-full replichat-resize-none replichat-rounded-xl replichat-border replichat-border-neutral-400 replichat-px-4 replichat-pr-16 replichat-shadow-sm replichat-scroll"
              />
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  className="replichat-absolute replichat-top-1/2 replichat-right-3 -replichat-translate-y-1/2"
                  onClick={stop}
                >
                  <IconPlayerStopFilled className="replichat-h-4 replichat-w-4" />
                  <span className="replichat-sr-only">Stop</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="replichat-absolute replichat-top-1/2 replichat-right-3 -replichat-translate-y-1/2"
                >
                  <IconSend className="replichat-h-4 replichat-w-4" />
                  <span className="replichat-sr-only">Send</span>
                </Button>
              )}
            </form>
            <div className="replichat-flex replichat-items-center replichat-gap-2">
              <p className="replichat-text-sm">Powered by</p>
              <a
                href="https://replichat.com"
                target="_blank"
                rel="noreferrer"
                className="replichat-flex replichat-items-center replichat-gap-1"
              >
                <img
                  src="https://chat.richardkovacs.dev/icon.png"
                  alt="Replichat"
                  width={20}
                  height={20}
                />
                <p>Replichat</p>
              </a>
            </div>
          </CardFooter>
        </Card>
      ) : null}
      <Button
        className="replichat-w-20 replichat-h-20 replichat-rounded-full replichat-bg-background replichat-text-text"
        variant="ghost"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <IconX size="50" />
        ) : (
          <IconMessageDots size="50" className="replichat-rotate-6" />
        )}
      </Button>
    </div>
  );
};

export default Chat;
