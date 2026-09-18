import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteNotification,
  receiveNotification,
  sendMessage,
} from "../api/greenApi";
import type { Chat, ChatMessage, Credentials } from "../types";

const STORAGE_KEY = "max-chat:chats";

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function useChats(creds: Credentials | null, apiUrl: string) {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [polling, setPolling] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const upsertChat = useCallback((chatId: string, title?: string) => {
    setChats((prev) => {
      if (prev.some((c) => c.chatId === chatId)) return prev;
      return [...prev, { chatId, title: title || chatId, messages: [] }];
    });
  }, []);

  const appendMessage = useCallback((chatId: string, msg: ChatMessage) => {
    setChats((prev) =>
      prev.map((c) =>
        c.chatId === chatId ? { ...c, messages: [...c.messages, msg] } : c
      )
    );
  }, []);

  const send = useCallback(
    async (chatId: string, text: string) => {
      if (!creds) throw new Error("Нет учётных данных");
      const res = await sendMessage(creds, apiUrl, chatId, text);
      appendMessage(chatId, {
        id: res.idMessage,
        chatId,
        text,
        direction: "out",
        timestamp: Date.now(),
      });
    },
    [creds, apiUrl, appendMessage]
  );

  // Long-polling loop for incoming messages (technology-http-api).
  useEffect(() => {
    if (!creds) return;
    stopRef.current = false;

    async function loop() {
      setPolling(true);
      while (!stopRef.current) {
        try {
          const startedAt = Date.now();
          const notification = await receiveNotification(creds!, apiUrl, 20);
          setPollError(null);
          if (!notification) {
            // GREEN-API is supposed to hold this request open for ~20s and only
            // return empty after that. If it answers right away instead, fall
            // back to a fixed delay so we don't hammer it with a tight loop.
            const elapsed = Date.now() - startedAt;
            if (elapsed < 1000) {
              await new Promise((r) => setTimeout(r, 1000 - elapsed));
            }
            continue;
          }

          const { receiptId, body } = notification;
          if (body?.typeWebhook === "incomingMessageReceived") {
            const chatId = body.senderData?.chatId;
            const text =
              body.messageData?.textMessageData?.textMessage ??
              body.messageData?.extendedTextMessageData?.text;
            if (chatId && text) {
              upsertChat(chatId, body.senderData?.chatName || chatId);
              appendMessage(chatId, {
                id: body.idMessage || String(receiptId),
                chatId,
                text,
                direction: "in",
                timestamp: (body.timestamp || Date.now() / 1000) * 1000,
              });
            }
          }
          await deleteNotification(creds!, apiUrl, receiptId);
        } catch (err) {
          setPollError(
            err instanceof Error ? err.message : "Ошибка получения уведомлений"
          );
          // back off briefly before retrying so we don't hammer the API
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
      setPolling(false);
    }

    loop();
    return () => {
      stopRef.current = true;
    };
  }, [creds, apiUrl, appendMessage, upsertChat]);

  return { chats, upsertChat, send, polling, pollError };
}
