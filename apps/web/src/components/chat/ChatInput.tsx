import { FormEvent, KeyboardEvent, useCallback, useMemo, useState } from 'react';
import styles from './ChatInput.module.css';

export interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  isPersonaSelected: boolean;
  isSending?: boolean;
  placeholder?: string;
  sendLabel?: string;
}

export function ChatInput({
  onSend,
  isPersonaSelected,
  isSending = false,
  placeholder = 'Mesajınızı yazın... (Enter ile gönder, Shift+Enter ile yeni satır)',
  sendLabel = 'Gönder',
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const isDisabled = useMemo(() => !isPersonaSelected || isSending, [isPersonaSelected, isSending]);

  const submit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setValue('');
  }, [onSend, value]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isDisabled) {
        return;
      }
      await submit();
    },
    [isDisabled, submit]
  );

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (isDisabled) {
          return;
        }
        await submit();
      }
    },
    [isDisabled, submit]
  );

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={placeholder}
          aria-label="Sohbet mesajı"
        />
        <button type="submit" className={styles.sendButton} disabled={isDisabled || value.trim().length === 0}>
          {isSending ? 'Gönderiliyor…' : sendLabel}
        </button>
      </form>
      {!isPersonaSelected && (
        <p className={styles.disabledNotice}>Sohbete başlamadan önce bir persona seçmelisiniz.</p>
      )}
    </div>
  );
}

export default ChatInput;
