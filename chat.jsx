import React from "react";
import { useChat } from "ai/react";

const Chat = () => {
  const [open, setOpen] = React.useState(false);
  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({
      api: "api/chat",
    });

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed flex flex-col justify-end right-10 bottom-10 gap-4">
      Hello, World!
    </div>
  );
};

export default Chat;
