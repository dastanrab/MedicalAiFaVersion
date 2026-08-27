/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_PUBLIC_APP_URL?: string;
  readonly VITE_EXTRACT_API_BASE_URL?: string;
  readonly VITE_LEGACY_CHAT_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
