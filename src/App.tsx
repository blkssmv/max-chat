import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { useChats } from "./hooks/useChats";
import type { Credentials } from "./types";

const CREDS_KEY = "max-chat:creds";
const API_URL_KEY = "max-chat:apiUrl";
const DEFAULT_API_URL = "https://api.greenapi.com";

function loadCreds(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [apiUrl, setApiUrl] = useState(
    () => localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL
  );
  const [creds, setCreds] = useState<Credentials | null>(() => loadCreds());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const { chats, upsertChat, send, polling, pollError } = useChats(creds, apiUrl);

  function handleAuth(newCreds: Credentials) {
    localStorage.setItem(CREDS_KEY, JSON.stringify(newCreds));
    localStorage.setItem(API_URL_KEY, apiUrl);
    setCreds(newCreds);
  }

  function handleLogout() {
    localStorage.removeItem(CREDS_KEY);
    setCreds(null);
    setActiveChatId(null);
  }

  if (!creds) {
    return (
      <AuthScreen apiUrl={apiUrl} onApiUrlChange={setApiUrl} onSubmit={handleAuth} />
    );
  }

  const activeChat = chats.find((c) => c.chatId === activeChatId) || null;

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={setActiveChatId}
        onCreate={(phone) => {
          const chatId = `${phone}@c.us`;
          upsertChat(chatId, phone);
          setActiveChatId(chatId);
        }}
        polling={polling}
        pollError={pollError}
      />
      <div className="main-panel">
        <div className="topbar">
          <span>Инстанс: {creds.idInstance}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
        <ChatWindow
          chat={activeChat}
          onSend={(text) => send(activeChat!.chatId, text)}
        />
      </div>
    </div>
  );
}
