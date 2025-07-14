"use client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

// Return a consistent default on SSR
function getNetworkInfo() {
  if (typeof window === "undefined") {
    return { online: true, saveData: false, effectiveType: "unknown" };
  }
  const conn = (navigator as any).connection || {};
  return {
    online: navigator.onLine,
    saveData: conn.saveData || false,
    effectiveType: conn.effectiveType || "unknown",
  };
}

// Hook that updates on online/offline and connection-change events
function useNetworkInfo() {
  const [info, setInfo] = useState(getNetworkInfo());

  useEffect(() => {
    function update() {
      setInfo(getNetworkInfo());
    }
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (conn) conn.removeEventListener("change", update);
    };
  }, []);

  return info;
}

export default function NetworkAlert({ pendingCount }: { pendingCount: number }) {
  const [mounted, setMounted] = useState(false);
  const net = useNetworkInfo();

  // Only render on the client to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <Alert
      className={`dark:bg-stone-800 relative flex items-center gap-3 p-4 rounded-lg shadow-sm border-l-4 ${
        net.online
          ? "border-l-green-500 bg-white border"
          : "border-l-red-500 bg-white border"
      }`}
    >
      <div
        className={`flex items-center justify-center h-9 w-9 rounded-full ${
          net.online ? "bg-green-50" : "bg-red-50"
        }`}
      >
        {net.online ? (
          <Wifi className="h-5 w-5 text-green-600" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${net.online ? "text-green-700" : "text-red-700"}`}>
            {net.online ? "Online" : "Offline"}
          </span>
          {net.saveData && net.online && (
            <span className="ml-1 px-2 py-0.5 rounded bg-green-100 text-xs text-green-700 font-medium">
              Data Saver
            </span>
          )}
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-700 font-medium">
              {pendingCount} pending report{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <AlertDescription className="text-sm text-gray-600 mt-1 dark:text-gray-200">
          {net.online
            ? `${net.effectiveType || "Unknown"} connection`
            : "Reports will be queued for sync"}
        </AlertDescription>
      </div>
    </Alert>
  );
}