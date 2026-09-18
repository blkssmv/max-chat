import { FormEvent, useEffect, useRef, useState } from "react";
import type { Chat } from "../types";

interface Props {
  chat: Chat | null;
  onSend: (text: string) => Promise<void>;
}

export function ChatWindow({ chat, onSend }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length]);

  useEffect(() => {
    setSendError(null);
  }, [chat?.chatId]);

  if (!chat) {
    return (
      <div className="chat-window empty">
        <p>Выберите чат слева или создайте новый по номеру телефона</p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await onSend(value);
      setText("");
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Не удалось отправить сообщение"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">{chat.title}</div>

      <div className="message-list">
        {chat.messages.map((m) => (
          <div key={m.id} className={`bubble ${m.direction}`}>
            <div className="bubble-text">{m.text}</div>
            <div className="bubble-time">
              {new Date(m.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {sendError && <div className="send-error">{sendError}</div>}

      <form className="message-input" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать сообщение..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          Отправить
        </button>
      </form>
    </div>
  );
}
