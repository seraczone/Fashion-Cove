import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isBrowser = typeof window !== "undefined";

const missingEnv = !supabaseUrl || !supabaseAnonKey;
if (missingEnv) {
  // Avoid throwing at module-evaluation time (which causes 500s on SSR/build).
  // Export a proxy that throws when used so the app fails with a clearer runtime error
  // only at the point of Supabase usage.
  // This helps deployments that forgot to set env vars recover the server rather than returning 500s.
  // eslint-disable-next-line no-console
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Supabase client not configured.");
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

let supabaseExport: any;
if (missingEnv) {
  const handler: ProxyHandler<any> = {
    get() {
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment before starting the app."
      );
    },
    apply() {
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment before starting the app."
      );
    },
  };
  // Proxy for any property access / call on the supabase client
  supabaseExport = new Proxy({}, handler);
} else {
  supabaseExport = createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
    },
    realtime: isBrowser ? undefined : { transport: ServerNoopWebSocket as unknown as typeof WebSocket },
  });
}

export const supabase = supabaseExport;
