import { notificationsAPI } from './api';

// Helper to convert VAPID public key base64 to Uint8Array for pushManager subscription
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const notificationService = {
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[NotificationService] Push notifications are not supported by this browser.');
      return;
    }

    try {
      // 1. Register or get existing service worker registration
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[NotificationService] Service Worker registered:', registration);

      // 2. Check and request notification permission if not yet denied
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('[NotificationService] Permission was not granted.');
          return;
        }
      } else if (Notification.permission !== 'granted') {
        console.log('[NotificationService] Permission is currently:', Notification.permission);
        return;
      }

      // 3. Fetch VAPID public key from backend
      const resKey = await notificationsAPI.getVapidPublicKey();
      const vapidPublicKey = resKey.data.data?.publicKey;

      // 4. Subscribe user to push service
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // 5. Send subscription to backend
      const subscriptionJson = subscription.toJSON();
      await notificationsAPI.subscribe({
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth
      });

      console.log('[NotificationService] Successfully registered Web Push Notification subscription.');
    } catch (err) {
      console.error('[NotificationService] Error initializing push notifications:', err);
    }
  }
};
