/**
 * Service Worker Registration
 * Registers the service worker for PWA functionality
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Registered successfully:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          console.log('[SW] New version available');
          // You can show a toast/notification here
          if (confirm('New version available! Reload to update?')) {
            window.location.reload();
          }
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[Notifications] Not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // Replace with your VAPID public key
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkGs-f2bZkRcXqlLkIzAgCj7wqYxK7pZQy8y8y8y8y='
      ) as BufferSource,
    });

    console.log('[Push] Subscribed:', subscription);
    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
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
 * Show local notification
 */
export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  });
}

/**
 * Check if app is installed (PWA)
 */
export function isPWAInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Install prompt handler
 */
export function setupInstallPrompt(): (() => Promise<void>) | null {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  return async () => {
    if (!deferredPrompt) {
      console.log('[Install] Prompt not available');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[Install] User response: ${outcome}`);
    deferredPrompt = null;
  };
}
