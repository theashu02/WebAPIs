export function sendNotification(title: string, options?: NotificationOptions) {
    // 1. Service-Worker context (no window global)
    if (
      typeof window === "undefined" &&
      typeof self !== "undefined" &&
      "registration" in self &&
      typeof (self as any).registration.showNotification === "function"
    ) {
      return (self as any).registration.showNotification(title, options);
    }
  
    // 2. Main-thread (window) context
    if (typeof window !== "undefined" && "Notification" in window) {
      // a) If we don’t yet have permission, request it
      if (Notification.permission !== "granted") {
        return Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            return new Notification(title, options);
          }
          return Promise.reject(new Error("Notification permission not granted"));
        });
      }
      // b) Already granted
      return new Notification(title, options);
    }
  
    // 3. Fallback when Notifications aren’t supported
    return Promise.reject(new Error("Notifications not supported in this context"));
  }