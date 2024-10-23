import MessageCard from "@/components/message-card";
import type { ClientMessage } from "@/app/ai";

interface MessageListProps {
  messages: ClientMessage[];
  visibilityRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  visibilityRef,
}) => (
  <>
    {messages.map((message: ClientMessage) => (
      <MessageCard
        key={message.id}
        id={JSON.stringify(message.id)}
        role={message.role}
        content={message.content}
        display={message.display}
        spinner={message.spinner}
        file={message.file}
        model={message.model}
      />
    ))}
    <div className="h-px w-full" ref={visibilityRef} />
  </>
);

export default MessageList;
