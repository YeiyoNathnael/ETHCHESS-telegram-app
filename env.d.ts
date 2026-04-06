/// <reference types="vite/client" />

declare global {
  interface Window {
    Telegram?: {
      WebApp?: unknown;
    };
  }
}

export {};
