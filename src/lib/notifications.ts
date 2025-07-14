export async function sendNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<Notification | void> {
  // 1) In a page: try window.Notification, else fall back to SW registration
  if (typeof window !== "undefined" && "Notification" in window) {
    // ensure permission
    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
    try {
      // may throw “Illegal constructor” in SW contexts
      return new Notification(title, options);
    } catch (err) {
      // fallback to the SW registration if available
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        return reg.showNotification(title, options);
      }
      throw err;
    }
  }

  // 2) In a Service Worker
  if (
    typeof self !== "undefined" &&
    "registration" in self &&
    typeof (self as any).registration.showNotification === "function"
  ) {
    return (self as any).registration.showNotification(title, options);
  }

  return Promise.reject(
    new Error("Notifications not supported in this context")
  );
}