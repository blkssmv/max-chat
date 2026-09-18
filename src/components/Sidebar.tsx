import { FormEvent, useState } from "react";
import type { Chat } from "../types";

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: (phone: string) => void;
  polling: boolean;
  pollError: string | null;
}

export function Sidebar({ chats, activeChatId, onSelect, onCreate, polling, pollError }: Props) {
  const [phone, setPhone] = useState("");

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!digits) return;
    onCreate(digits);
    setPhone("");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Чаты</span>
        <span
          className={`status-dot ${polling ? "online" : "offline"}`}
          title={pollError ? pollError : polling ? "Получение сообщений активно" : "Остановлено"}
        />
      </div>

      <form className="new-chat-form" onSubmit={handleCreate}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона получателя"
        />
        <button type="submit">+</button>
      </form>

      <div className="chat-list">
        {chats.length === 0 && <div className="empty-hint">Пока нет чатов</div>}
        {chats.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <button
              key={chat.chatId}
              className={`chat-list-item ${chat.chatId === activeChatId ? "active" : ""}`}
              onClick={() => onSelect(chat.chatId)}
            >
              <div className="chat-title">{chat.title}</div>
              {last && <div className="chat-preview">{last.text}</div>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
