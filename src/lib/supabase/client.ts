import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isBrowser = typeof window !== "undefined";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
}

class ServerNoopWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = ServerNoopWebSocket.CONNECTING;
  readonly OPEN = ServerNoopWebSocket.OPEN;
  readonly CLOSING = ServerNoopWebSocket.CLOSING;
  readonly CLOSED = ServerNoopWebSocket.CLOSED;
  readonly readyState = ServerNoopWebSocket.CLOSED;
  readonly url: string;
  readonly protocol = "";
  binaryType?: string;
  bufferedAmount = 0;
  extensions = "";
  onopen: ((this: WebSocket, event: Event) => unknown) | null = null;
  onmessage: ((this: WebSocket, event: MessageEvent) => unknown) | null = null;
  onclose: ((this: WebSocket, event: CloseEvent) => unknown) | null = null;
  onerror: ((this: WebSocket, event: Event) => unknown) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  close() {}

  send() {
    throw new Error("Supabase Realtime is only available in the browser runtime.");
  }

  addEventListener() {}

  removeEventListener() {}

  dispatchEvent() {
    return false;
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
  realtime: isBrowser ? undefined : { transport: ServerNoopWebSocket as unknown as typeof WebSocket },
});
