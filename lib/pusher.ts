import PusherServer from "pusher";
import PusherClient from "pusher-js";

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

const isPusherConfigured = PUSHER_KEY && PUSHER_KEY !== "your-key" && PUSHER_CLUSTER !== "your-cluster";

if (!isPusherConfigured && typeof window !== "undefined") {
  console.warn("Pusher is not configured. Real-time features will be disabled. Check your .env file.");
}

// Server-side (API Routes)
export const pusherServer = isPusherConfigured 
  ? new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: PUSHER_KEY,
      secret: process.env.PUSHER_SECRET!,
      cluster: PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

// Client-side (Frontend)
export const pusherClient = isPusherConfigured
  ? new PusherClient(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    })
  : null;
