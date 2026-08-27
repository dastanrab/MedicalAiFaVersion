function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function readEnv(name: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[name];
  if (typeof value === 'string' && value.trim()) {
    return stripTrailingSlash(value.trim());
  }
  return stripTrailingSlash(fallback);
}

function httpOriginFromWs(wsUrl: string): string {
  if (wsUrl.startsWith('wss://')) return `https://${wsUrl.slice('wss://'.length)}`;
  if (wsUrl.startsWith('ws://')) return `http://${wsUrl.slice('ws://'.length)}`;
  return wsUrl;
}

/**
 * Current backend origin. Override with VITE_API_BASE_URL.
 * Production Android builds should use https:// — do not invent a domain here.
 */
export const API_ORIGIN = readEnv('VITE_API_BASE_URL', 'http://185.222.163.113:7000');

/** REST prefix: `{API_ORIGIN}/api` */
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const USER_API_BASE_URL = `${API_BASE_URL}/user`;
export const OWNER_API_BASE_URL = `${API_BASE_URL}/owner`;

/**
 * WebSocket origin for live chat. Override with VITE_WS_URL (ws:// or wss://).
 * Do not derive this from window.location.protocol — Capacitor is https://localhost
 * even when the chat server still speaks plain ws://.
 */
export const WS_URL = readEnv('VITE_WS_URL', 'ws://185.222.163.113:4070');

/** HTTP API that lives on the chat/WebSocket host (port 4070 today). */
export const CHAT_HTTP_ORIGIN = httpOriginFromWs(WS_URL);

/**
 * Public https origin for shareable links (partner invites, app links).
 * Must be a real public website, never Capacitor's https://localhost.
 */
export const PUBLIC_APP_URL = readEnv(
  'VITE_PUBLIC_APP_URL',
  typeof window !== 'undefined' ? window.location.origin : '',
);

/**
 * Food/exercise extract service. Default is loopback and will not work on a device.
 * Set VITE_EXTRACT_API_BASE_URL to a host the phone can reach.
 */
export const EXTRACT_API_BASE_URL = readEnv(
  'VITE_EXTRACT_API_BASE_URL',
  'http://127.0.0.1:8000',
);

/** Older diagnosis chat host used by MedicalChat.tsx (port 8000). */
export const LEGACY_CHAT_API_BASE_URL = readEnv(
  'VITE_LEGACY_CHAT_API_BASE_URL',
  'http://185.222.163.113:8000',
);

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalized}`;
}

export function storageUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return apiUrl(path);
}

export function chatWebSocketUrl(roomId: string | number, token: string): string {
  return `${WS_URL}/ws/chat/${roomId}?token=${encodeURIComponent(token)}`;
}

export function publicInviteUrl(code: string): string {
  return `${PUBLIC_APP_URL}/invite/${code}`;
}
