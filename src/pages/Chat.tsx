
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { ChatMessage as ChatMessageType } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { processMessage } from "@/lib/skills/skillsManager";
import { Badge } from "@/components/ui/badge";

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
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
  }, [messages, debugInfo]);

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
      setError("Error fetching messages");
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
    if (!user || !content.trim() || isLoading) return;

    setError(null);
    setDebugInfo(null);
    
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
    
    // Process with skills system
    processWithSkills(content);
  };

  // Process message with skills system
  const processWithSkills = async (userMessage: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Process the message using our skills system
      console.log(`Processing message: "${userMessage}"`);
      const result = await processMessage(userMessage, messages, user.id);
      
      const aiMessage: ChatMessageType = {
        id: uuidv4(),
        user_id: user.id,
        content: result.content,
        role: "assistant",
        created_at: new Date().toISOString(),
      };
      
      // Show debug info if skill metadata is present
      if (result.metadata) {
        const skillId = result.metadata.skillId || "unknown";
        setDebugInfo(`Processed with skill: ${skillId}`);
        console.log(`Message processed with skill: ${skillId}`, result.metadata);
      }
      
      setMessages((prev) => [...prev, aiMessage]);
      await saveMessage(aiMessage);
    } catch (error: any) {
      console.error("Skills processing error:", error);
      setError("Failed to generate response. Please try again.");
      toast.error("Error generating response: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle debug info
  const toggleDebugMode = () => {
    const newState = !debugInfo;
    setDebugInfo(newState ? "Debug mode enabled" : null);
  };

  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Error message */}
      {error && (
        <div className="container mx-auto max-w-4xl px-4 pt-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Debug info */}
      {debugInfo && (
        <div className="container mx-auto max-w-4xl px-4 pt-2">
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Debug Info</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              {debugInfo}
              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && 
                messages[messages.length - 1].content.includes('Click here to connect') && (
                <Badge className="bg-amber-500">Requires Calendar Auth</Badge>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Chat container */}
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
      
      {/* Input area */}
      <div className="container mx-auto max-w-4xl px-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Chat;
