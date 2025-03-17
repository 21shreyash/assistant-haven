
import { useAuth } from "@/components/AuthProvider";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import ChatError from "@/components/ChatError";
import { useChat } from "@/hooks/useChat";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Chat = () => {
  const { user, isAuthenticatedWithGoogle, signInWithGoogle } = useAuth();
  const { 
    messages,
    isLoading,
    error,
    debugInfo,
    handleSendMessage,
    toggleDebugMode
  } = useChat(user?.id);
  const location = useLocation();
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  
  // Check URL parameters for calendar connection status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const calendarConnected = params.get('calendar_connected');
    
    // If not authenticated with Google and no calendar success parameter, show prompt
    if (!isAuthenticatedWithGoogle && calendarConnected !== 'success') {
      setShowGooglePrompt(true);
    } else {
      setShowGooglePrompt(false);
    }
  }, [location, isAuthenticatedWithGoogle]);

  return (
    <div className="flex flex-col h-screen pt-16">
      <ChatError 
        error={error} 
        debugInfo={debugInfo} 
        messages={messages} 
      />
      
      {showGooglePrompt && (
        <div className="container mx-auto max-w-4xl px-4 pt-2">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200 mb-2">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 mt-0.5 text-blue-600" />
              <div className="flex-1">
                <AlertDescription>
                  Sign in with Google to enable calendar features without additional setup.
                </AlertDescription>
                <Button 
                  className="mt-2 bg-white text-blue-600 hover:bg-blue-100 border border-blue-300"
                  size="sm"
                  onClick={() => signInWithGoogle(true)}
                >
                  Connect Google Account
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-blue-600"
                onClick={() => setShowGooglePrompt(false)}
              >
                ✕
              </Button>
            </div>
          </Alert>
        </div>
      )}
      
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
