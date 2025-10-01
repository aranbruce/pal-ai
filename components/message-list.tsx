import MessageCard from "@/components/message-card";
import { Message } from "ai";

interface MessageListProps {
  messages: Message[];
  visibilityRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  visibilityRef,
}) => (
  <>
    {messages.map((message: Message) => (
      <MessageCard
        key={message.id}
        id={message.id}
        role={message.role}
        content={message.content}
        toolInvocations={message.toolInvocations}
      />
    ))}
    <div className="h-px w-full" ref={visibilityRef} />
  </>
);

export default MessageList;
