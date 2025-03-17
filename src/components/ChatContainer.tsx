
import { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/supabase";
import ChatMessage from "@/components/ChatMessage";
import { Badge } from "@/components/ui/badge";

interface ChatContainerProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  debugInfo: string | null;
  toggleDebugMode: () => void;
}

const ChatContainer = ({ 
  messages, 
  isLoading, 
  debugInfo, 
  toggleDebugMode 
}: ChatContainerProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, debugInfo]);

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-end mb-4">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-muted" 
            onClick={toggleDebugMode}
          >
            {debugInfo ? "Hide Debug" : "Show Debug"}
          </Badge>
        </div>
        
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLast={index === messages.length - 1} 
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="chat-bubble-ai animate-pulse-slow flex gap-2 items-center">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse-slow"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse-slow" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse-slow" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
