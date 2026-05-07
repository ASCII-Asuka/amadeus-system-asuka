import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import styles from './index.module.less'
import type { ChatMessage } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown, Bot, User } from 'lucide-react'

interface ChatHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatHistory: ChatMessage[];
  onDeleteHistory: () => void;
}

const ChatHistory = ({ open, onOpenChange, chatHistory, onDeleteHistory }: ChatHistoryProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [open, chatHistory]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    // Check if user has scrolled up from the bottom (with a 100px threshold)
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    setShowScrollButton(!isAtBottom);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] h-[80vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border/50 shadow-2xl">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight">{t('history.title')}</DialogTitle>
          <Button variant="destructive" size="sm" onClick={onDeleteHistory} className="ml-auto shadow-sm">
            {t('history.clear')}
          </Button>
        </DialogHeader>
        
        <div className="flex-1 relative overflow-hidden">
          <ScrollArea 
            className="h-full p-6 pt-4" 
            ref={scrollRef}
            onScrollCapture={handleScroll}
          >
            <div className={styles.historyContainer}>
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    styles.messageWrapper,
                    msg.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper
                  )}
                >
                  {msg.role !== 'user' && (
                    <div className={styles.avatar}>
                      <Bot size={20} />
                    </div>
                  )}
                  
                  <div className={styles.messageContentWrapper}>
                    <div className={styles.nameLabel}>
                      {msg.role === 'user' ? t('history.user') : t('history.ai')}
                    </div>
                    <div 
                      className={cn(
                        styles.message,
                        msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                      )}
                    >
                      <div className={styles.messageContent}>{msg.content}</div>
                      <div className={styles.timestamp}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className={cn(styles.avatar, styles.userAvatar)}>
                      <User size={20} />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} className="h-1" />
            </div>
          </ScrollArea>
          
          <div 
            className={cn(
              "absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 z-10",
              showScrollButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
            )}
          >
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-full shadow-md border bg-background/90 backdrop-blur hover:bg-muted"
              onClick={scrollToBottom}
            >
              <ArrowDown className="w-4 h-4 mr-1" />
              {t('history.latest')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChatHistory 