"use client";
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkInfo {
  online: boolean;
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
}

interface NetworkStatusProps {
  networkInfo: NetworkInfo;
  pendingCount: number;
}

export default function NetworkStatus({
  networkInfo,
  pendingCount,
}: NetworkStatusProps) {
  return (
    <Alert
      className={
        networkInfo.online
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }
    >
      <div className="flex items-center gap-2">
        {networkInfo.online ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          {networkInfo.online
            ? `Online${networkInfo.saveData ? " (Data Saver Mode)" : ""} - ${
                networkInfo.effectiveType || "Unknown"
              } connection`
            : "Offline - Reports will be queued for sync"}
          {pendingCount > 0 && (
            <span className="ml-2 font-medium">
              ({pendingCount} pending report
              {pendingCount !== 1 ? "s" : ""})
            </span>
          )}
        </AlertDescription>
        <div className="text-xs text-gray-600 ml-6 space-x-2">
          {networkInfo.effectiveType && (
            <span>Type: {networkInfo.effectiveType.toUpperCase()}</span>
          )}
          {networkInfo.downlink != null && (
            <span>Speed: {networkInfo.downlink} Mbps</span>
          )}
          {networkInfo.rtt != null && <span>RTT: {networkInfo.rtt} ms</span>}
          {networkInfo.saveData && <span>Data Saver On</span>}
        </div>
      </div>
    </Alert>
  );
}
