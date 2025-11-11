import { ReactNode, useEffect, useMemo, useRef } from 'react';
import styles from './ChatWindow.module.css';

export type ChatRole = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp?: string | number | Date;
  isTyping?: boolean;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
  typingIndicator?: boolean;
  emptyState?: ReactNode;
  getAvatarLabel?: (role: ChatRole) => ReactNode;
  className?: string;
}

const DEFAULT_EMPTY_STATE = (
  <div className={styles.emptyState}>
    Persona seçiminizi yapın ve ilk sorunuzu sorun.
  </div>
);

const DEFAULT_AVATAR: Record<ChatRole, string> = {
  user: 'Siz',
  bot: 'AI',
};

export function ChatWindow({
  messages,
  typingIndicator = false,
  emptyState = DEFAULT_EMPTY_STATE,
  getAvatarLabel,
  className,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mergedClassName = useMemo(
    () => [styles.container, className].filter(Boolean).join(' '),
    [className]
  );

  const visibleMessages = useMemo(
    () => messages.filter((message) => !message.isTyping),
    [messages]
  );

  const showTypingIndicator = useMemo(() => {
    if (typingIndicator) {
      return true;
    }

    return messages.some((message) => message.isTyping);
  }, [messages, typingIndicator]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 120;

    if (isNearBottom) {
      container.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    }
  }, [visibleMessages, showTypingIndicator]);

  const formatTimestamp = (timestamp?: string | number | Date) => {
    if (!timestamp) {
      return undefined;
    }

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAvatar = (role: ChatRole) => {
    return <div className={styles.avatar}>{getAvatarLabel?.(role) ?? DEFAULT_AVATAR[role]}</div>;
  };

  return (
    <div className={mergedClassName}>
      <div ref={containerRef} className={styles.messages}>
        {visibleMessages.length === 0 && !showTypingIndicator ? (
          emptyState
        ) : (
          <>
            {visibleMessages.map((message) => {
              const rowClassName = `${styles.messageRow} ${
                message.role === 'user' ? styles.messageRowUser : styles.messageRowBot
              }`;
              const bubbleClassName = `${styles.message} ${
                message.role === 'user' ? styles.messageUser : styles.messageBot
              }`;
              const timestampLabel = formatTimestamp(message.timestamp);

              return (
                <div key={message.id} className={rowClassName}>
                  {message.role === 'bot' && renderAvatar('bot')}
                  <div>
                    <div className={bubbleClassName}>{message.content}</div>
                    {timestampLabel && <span className={styles.timestamp}>{timestampLabel}</span>}
                  </div>
                  {message.role === 'user' && renderAvatar('user')}
                </div>
              );
            })}

            {showTypingIndicator && (
              <div className={`${styles.messageRow} ${styles.messageRowBot}`}>
                {renderAvatar('bot')}
                <div className={styles.typingIndicatorWrapper}>
                  <div className={styles.typingIndicator}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
