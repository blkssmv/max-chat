import { FormEvent, useState } from "react";
import { checkCredentials, ensureIncomingWebhookEnabled } from "../api/greenApi";
import type { Credentials } from "../types";

interface Props {
  apiUrl: string;
  onApiUrlChange: (v: string) => void;
  onSubmit: (creds: Credentials) => void;
}

export function AuthScreen({ apiUrl, onApiUrlChange, onSubmit }: Props) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError("Заполните оба поля");
      return;
    }
    setChecking(true);
    setError(null);
    const creds = { idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() };
    const ok = await checkCredentials(creds, apiUrl);
    if (!ok) {
      setChecking(false);
      setError("Не удалось авторизоваться. Проверьте idInstance, apiTokenInstance и apiUrl.");
      return;
    }
    // ReceiveNotification only delivers incoming messages if this is on;
    // it's off by default on a fresh instance, so make sure it's enabled.
    try {
      await ensureIncomingWebhookEnabled(creds, apiUrl);
    } catch {
      // Non-fatal: login still proceeds, incoming messages just may not arrive
      // until the instance settings are checked manually.
    }
    setChecking(false);
    onSubmit(creds);
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>MAX Chat</h1>
        <p className="auth-subtitle">Вход через учётные данные GREEN-API</p>

        <label>
          apiUrl
          <input
            value={apiUrl}
            onChange={(e) => onApiUrlChange(e.target.value)}
            placeholder="https://api.greenapi.com"
          />
        </label>

        <label>
          idInstance
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101000001"
            autoFocus
          />
        </label>

        <label>
          apiTokenInstance
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="d75b3a66374942c5b3c019c698abc2067e15..."
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={checking}>
          {checking ? "Проверка..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
