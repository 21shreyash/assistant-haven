
import { useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/supabase';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type ChatMessageProps = {
  message: ChatMessageType;
  isLast?: boolean;
};

const ChatMessage = ({ message, isLast = false }: ChatMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.role === 'user';

  useEffect(() => {
    if (isLast && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLast]);

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex w-full mb-4 animate-slide-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={cn(
        'flex max-w-[80%] md:max-w-[70%]',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        <Avatar className={cn(
          'h-8 w-8 border-2 bg-background',
          isUser ? 'ml-2' : 'mr-2'
        )}>
          <div className={cn(
            'flex h-full w-full items-center justify-center rounded-full',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          )}>
            {isUser ? 'U' : 'AI'}
          </div>
        </Avatar>
        
        <div className={cn(
          'flex flex-col',
          isUser ? 'items-end' : 'items-start'
        )}>
          <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
