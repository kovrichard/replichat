import React from "react";
import { useChat } from "ai/react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconMessage2Plus,
  IconX,
  IconMessageDots,
  IconSend,
} from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const Chat = () => {
  const [open, setOpen] = React.useState(false);
  const {
    messages,
    setMessages,
    isLoading,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: process.env.BACKEND_URL,
  });

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed flex flex-col items-end right-10 bottom-10 gap-4">
      {open ? (
        <Card
          className={cn(
            "sm:w-96 rounded-2xl shadow-lg bg-background",
            open ? "slide-in" : "slide-out"
          )}
        >
          <CardHeader className="relative justify-center flex-row gap-2 border-b p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="absolute z-10 -right-[2px] -top-[2px]">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="./public/richard-kovacs.webp" />
                  <AvatarFallback>RK</AvatarFallback>
                </Avatar>
              </div>
              <div className="font-medium">Richard's Alter Ego</div>
              <Button
                className="absolute right-3 bottom-3"
                size="icon"
                onClick={() => setMessages([])}
              >
                <IconMessage2Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="h-[400px]">
            <CardContent className="p-4 grid gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" ? "justify-end" : ""
                  )}
                >
                  {message.role !== "user" ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="./public/richard-kovacs.webp" />
                      <AvatarFallback>RK</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <div
                    className={cn(
                      "rounded-lg bg-muted p-3 text-sm",
                      message.role === "user"
                        ? ""
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  {message.role === "user" ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="./public/profile.svg" />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                  ) : null}
                </div>
              ))}
              {isLoading && messages[messages.length - 1].role === "user" ? (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/blog/authors/richard-kovacs.webp" />
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <span className="rounded-lg bg-primary text-primary-foreground p-3 text-sm animate-pulse">
                    ...
                  </span>
                </div>
              ) : null}
            </CardContent>
          </ScrollArea>
          <CardFooter className="flex flex-col border-t p-4 gap-2">
            <form
              className="relative w-full"
              onSubmit={handleSubmit}
              onKeyDown={onKeyDown}
            >
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                className="h-16 min-h-0 w-full resize-none rounded-xl border border-neutral-400 px-4 pr-16 shadow-sm scroll"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 right-3 -translate-y-1/2"
              >
                <IconSend className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="text-sm">Powered by Chat.tsx</p>
          </CardFooter>
        </Card>
      ) : null}
      <Button
        className="w-20 h-20 rounded-full"
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
