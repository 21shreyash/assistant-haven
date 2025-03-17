
import { useState, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { processMessage } from "@/lib/skills/skillsManager";

export function useChat(userId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Fetch messages when component mounts
  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    try {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // If no messages, add a welcome message
      if (data.length === 0) {
        const welcomeMessage: ChatMessageType = {
          id: uuidv4(),
          user_id: userId,
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
    if (!userId || !content.trim() || isLoading) return;

    setError(null);
    setDebugInfo(null);
    
    // Create user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      user_id: userId,
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
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      // Process the message using our skills system
      console.log(`Processing message: "${userMessage}"`);
      const result = await processMessage(userMessage, messages, userId);
      
      const aiMessage: ChatMessageType = {
        id: uuidv4(),
        user_id: userId,
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

  return {
    messages,
    isLoading,
    error,
    debugInfo,
    handleSendMessage,
    toggleDebugMode
  };
}
