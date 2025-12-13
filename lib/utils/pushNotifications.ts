/**
 * Web Push Notifications Utility
 * 
 * This module handles browser push notifications for real-time updates.
 * To use web-push on the server, install: npm install web-push
 * 
 * Generate VAPID keys using: npx web-push generate-vapid-keys
 */

// Client-side utilities for managing push notification subscriptions

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isPushSupported()) return null;
  return Notification.permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // Create new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  return subscription;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    return true;
  }

  return false;
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  return !!subscription;
}

/**
 * Show a local notification (no server push required)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isPushSupported()) {
    throw new Error('Notifications are not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    ...options,
  });
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Notification types for the app
 */
export interface AppNotification {
  type:
    | 'event_reminder'
    | 'event_update'
    | 'new_event'
    | 'spot_available'
    | 'event_cancelled'
    | 'new_message'
    | 'follow'
    | 'general';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    eventId?: string;
    userId?: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Format notification for display
 */
export function formatNotificationForPush(notification: AppNotification): NotificationOptions {
  const icons: Record<string, string> = {
    event_reminder: '🔔',
    event_update: '📝',
    new_event: '🎉',
    spot_available: '🎟️',
    event_cancelled: '❌',
    new_message: '💬',
    follow: '👤',
    general: '📢',
  };

  return {
    body: notification.body,
    icon: notification.icon || '/icon-192x192.png',
    badge: notification.badge || '/badge-72x72.png',
    tag: notification.type,
    renotify: true,
    requireInteraction: notification.type === 'event_reminder',
    data: notification.data,
    actions: notification.actions,
    vibrate: [200, 100, 200],
  };
}

/**
 * Save push subscription to server
 */
export async function savePushSubscription(
  subscription: PushSubscription,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return false;
  }
}

/**
 * Remove push subscription from server
 */
export async function removePushSubscription(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/push-subscription', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return false;
  }
}
