import type { Credentials, IncomingMessageNotification } from "../types";

/**
 * Thin wrapper around the three GREEN-API MAX methods required by the task:
 *  - SendMessage                (POST)
 *  - ReceiveNotification        (GET, long-polling)
 *  - DeleteNotification         (DELETE)
 *
 * Docs:
 *  https://green-api.com/v3/docs/api/sending/SendMessage/
 *  https://green-api.com/v3/docs/api/receiving/technology-http-api/
 */

function baseUrl(creds: Credentials, apiUrl: string) {
  return `${apiUrl.replace(/\/+$/, "")}/waInstance${creds.idInstance}`;
}

export class GreenApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GreenApiError(body || res.statusText, res.status);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Sends a text message to a chat. Returns the new message id. */
export async function sendMessage(
  creds: Credentials,
  apiUrl: string,
  chatId: string,
  message: string
): Promise<{ idMessage: string }> {
  const url = `${baseUrl(creds, apiUrl)}/sendMessage/${creds.apiTokenInstance}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });
  return handle(res);
}

/** Long-polls for a single incoming notification (waits up to `timeout` seconds). */
export async function receiveNotification(
  creds: Credentials,
  apiUrl: string,
  timeout = 20
): Promise<{ receiptId: number; body: IncomingMessageNotification } | null> {
  const url = `${baseUrl(creds, apiUrl)}/receiveNotification/${creds.apiTokenInstance}?receiveTimeout=${timeout}`;
  const res = await fetch(url);
  return handle(res);
}

/** Confirms processing of a notification so it's removed from the queue. */
export async function deleteNotification(
  creds: Credentials,
  apiUrl: string,
  receiptId: number
): Promise<{ result: boolean }> {
  const url = `${baseUrl(creds, apiUrl)}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`;
  const res = await fetch(url, { method: "DELETE" });
  return handle(res);
}

/** Quick credential check: getSettings is a lightweight authenticated GET. */
export async function checkCredentials(
  creds: Credentials,
  apiUrl: string
): Promise<boolean> {
  const url = `${baseUrl(creds, apiUrl)}/getSettings/${creds.apiTokenInstance}`;
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}
