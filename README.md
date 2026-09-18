# MAX Chat — тестовое задание (GREEN-API)

Простой веб-интерфейс для отправки и получения текстовых сообщений в MAX через
[GREEN-API](https://green-api.com/max). Стек: **React + TypeScript + Vite**.

## Что реализовано

- Экран входа: пользователь вводит `idInstance` и `apiTokenInstance` из личного
  кабинета GREEN-API (данные хранятся только в `localStorage` браузера).
- Создание нового чата по номеру телефона получателя.
- Отправка текстовых сообщений методом
  [`SendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/).
- Получение сообщений через long-polling методом
  [`ReceiveNotification`](https://green-api.com/v3/docs/api/receiving/technology-http-api/)
  с последующим подтверждением `DeleteNotification`.
- Минимальный UI в духе [web.max.ru](https://web.max.ru/): список чатов слева,
  переписка справа.

## Локальный запуск

Требуется Node.js 18+.

```bash
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`.

Сборка production-версии:

```bash
npm run build
npm run preview
```

## Как пользоваться

1. Зарегистрируйтесь в [личном кабинете GREEN-API](https://console.green-api.com/),
   создайте инстанс для MAX и авторизуйте его.
2. На экране входа введите `idInstance` и `apiTokenInstance` (и при необходимости
   свой `apiUrl`, если в кабинете указан инстанс-специфичный хост, например
   `https://7103.api.green-api.com`; по умолчанию используется `https://api.greenapi.com`).
3. Создайте новый чат, введя номер телефона получателя (с кодом страны, без `+` и пробелов).
4. Напишите сообщение — оно уйдёт получателю в MAX.
5. Ответ получателя появится в чате автоматически: приложение постоянно
   опрашивает `ReceiveNotification` в фоне и подтверждает получение через
   `DeleteNotification`.

## Структура проекта

```
src/
  api/greenApi.ts       — обёртка над SendMessage / ReceiveNotification / DeleteNotification
  hooks/useChats.ts      — состояние чатов + цикл long-polling
  components/
    AuthScreen.tsx        — экран входа
    Sidebar.tsx            — список чатов + создание нового
    ChatWindow.tsx          — переписка и поле ввода
  App.tsx                — сборка экранов, хранение сессии в localStorage
```

## Ограничения (сознательно, согласно ТЗ)

- Поддерживаются только текстовые сообщения (без файлов, голосовых, групп).
- Список чатов и история сообщений хранятся локально в браузере (localStorage),
  без бэкенда и базы данных — этого не требовалось по заданию.
- Учётные данные не шифруются: для тестового задания это осознанное упрощение,
  в продакшене их стоит хранить на сервере, а не в браузере.
