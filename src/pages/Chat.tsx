
import { useAuth } from "@/components/AuthProvider";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import ChatError from "@/components/ChatError";
import { useChat } from "@/hooks/useChat";

const Chat = () => {
  const { user } = useAuth();
  const { 
    messages,
    isLoading,
    error,
    debugInfo,
    handleSendMessage,
    toggleDebugMode
  } = useChat(user?.id);

  return (
    <div className="flex flex-col h-screen pt-16">
      <ChatError 
        error={error} 
        debugInfo={debugInfo} 
        messages={messages} 
      />
      
      <ChatContainer 
        messages={messages}
        isLoading={isLoading}
        debugInfo={debugInfo}
        toggleDebugMode={toggleDebugMode}
      />
      
      <div className="container mx-auto max-w-4xl px-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default Chat;
