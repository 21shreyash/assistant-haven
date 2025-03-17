
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChatMessage as ChatMessageType } from "@/lib/supabase";

interface ChatErrorProps {
  error: string | null;
  debugInfo: string | null;
  messages: ChatMessageType[];
}

const ChatError = ({ error, debugInfo, messages }: ChatErrorProps) => {
  if (!error && !debugInfo) return null;
  
  return (
    <div className="container mx-auto max-w-4xl px-4 pt-2">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
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
      )}
    </div>
  );
};

export default ChatError;
