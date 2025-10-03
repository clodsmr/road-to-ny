import { getMessaging, getToken, onMessage } from "firebase/messaging";

export async function requestPermissionAndToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
    });
    return token;
  } catch (err) {
    console.error("FCM Error:", err);
    return null;
  }
}

export function listenForegroundMessages() {
  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
    new Notification(payload.notification?.title || "Risparmia!!", {
      body: payload.notification?.body,
    });
  });
}
