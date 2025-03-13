
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { ChatMessage as ChatMessageType } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch messages when component mounts
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // If no messages, add a welcome message
      if (data.length === 0) {
        const welcomeMessage: ChatMessageType = {
          id: uuidv4(),
          user_id: user.id,
          content: "Hello! I'm your AI assistant. How can I help you today?",
          role: "assistant",
          created_at: new Date().toISOString(),
        };
        
        setMessages([welcomeMessage]);
        await saveMessage(welcomeMessage);
      } else {
        setMessages(data as ChatMessageType[]);
      }
    } catch (error: any) {
      toast.error("Error fetching messages: " + error.message);
    }
  };

  // Save message to Supabase
  const saveMessage = async (message: ChatMessageType) => {
    try {
      const { error } = await supabase.from("messages").insert(message);
      if (error) throw error;
    } catch (error: any) {
      toast.error("Error saving message: " + error.message);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    // Create user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      user_id: user.id,
      content: content.trim(),
      role: "user",
      created_at: new Date().toISOString(),
    };

    // Add to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    
    // Save to database
    await saveMessage(userMessage);
    
    // Simulate AI response
    simulateResponse(content);
  };

  // Simulate AI response (replace with actual AI call)
  const simulateResponse = async (userMessage: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Generate a simple response
      let responseContent = `I've received your message: "${userMessage}"`;
      
      // Customize response based on common queries
      if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
        responseContent = "Hello! How can I assist you today?";
      } else if (userMessage.toLowerCase().includes("help")) {
        responseContent = "I'm here to help! You can ask me questions, request information, or just chat. What would you like to know?";
      } else if (userMessage.toLowerCase().includes("thank")) {
        responseContent = "You're welcome! Is there anything else I can help you with?";
      } else if (userMessage.toLowerCase().includes("weather")) {
        responseContent = "I'm not connected to real-time weather data yet, but I can help you with many other topics. What else would you like to know?";
      } else {
        responseContent = "I understand you said: \"" + userMessage + "\". In a fully implemented version, I would provide a more contextual response based on your input.";
      }
      
      const aiMessage: ChatMessageType = {
        id: uuidv4(),
        user_id: user.id,
        content: responseContent,
        role: "assistant",
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      await saveMessage(aiMessage);
    } catch (error: any) {
      toast.error("Error generating response: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Chat container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="container mx-auto max-w-4xl">
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
      
      {/* Input area */}
      <div className="container mx-auto max-w-4xl px-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Chat;
