export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  direction: "in" | "out";
  timestamp: number;
}

export interface Chat {
  chatId: string;
  title: string;
  messages: ChatMessage[];
}

/** Shape of the notification body returned by ReceiveNotification
 *  for an incoming text message (technology-http-api). */
export interface IncomingMessageNotification {
  typeWebhook: string;
  timestamp: number;
  idMessage?: string;
  senderData?: {
    chatId: string;
    sender: string;
    senderName?: string;
    chatName?: string;
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
    extendedTextMessageData?: {
      text: string;
    };
  };
}
