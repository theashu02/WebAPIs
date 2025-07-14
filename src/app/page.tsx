"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "./components/Header";
import NetworkStatus from "./components/NetworkStatus";
import MapSection from "./components/MapSection";
import ReportForm from "./components/ReportForm";
import ReportsQueue from "./components/ReportsQueue";
import {
  sendNotification,
  sendEmergencyAlert,
} from "./components/NotificationManager";

export interface DisasterReport {
  id: string;
  type: string;
  severity: string;
  description: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: number;
  status: "pending" | "sent" | "failed";
  retryCount: number;
}

interface NetworkInfo {
  online: boolean;
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
}

export default function DisasterReporter() {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    online: navigator.onLine,
  });
  const [currentLocation, setCurrentLocation] =
    useState<GeolocationPosition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    severity: "",
    description: "",
  });
  const [showMap, setShowMap] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Load saved reports
  useEffect(() => {
    const saved = localStorage.getItem("disaster-reports");
    if (saved) setReports(JSON.parse(saved));
  }, []);

  // Persist reports
  useEffect(() => {
    localStorage.setItem("disaster-reports", JSON.stringify(reports));
  }, [reports]);

  // Network monitoring
  useEffect(() => {
    // const update = () => {networkInfo
    //   const conn =
    //     (navigator as any).connection ||
    //     (navigator as any).mozConnection ||
    //     (navigator as any).webkitConnection;
    //   setNetworkInfo({
    //     online: navigator.onLine,
    //     effectiveType: conn?.effectiveType,
    //     saveData: conn?.saveData,
    //   });
    // };
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    const updateNetworkInfo = () => {
      setNetworkInfo({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      });
    };

    const onOnline = () => {
      toast("Attempting to sync pending reports...");
      // syncPendingReports();
      updateNetworkInfo()
      toast("Connection restored — syncing pending reports…")
    };
    const onOffline = () => {
      updateNetworkInfo();
      toast("Reports will be queued for later sync");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    connection?.addEventListener("change", updateNetworkInfo);
    updateNetworkInfo();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      connection?.removeEventListener("change", updateNetworkInfo);
    };
  }, []);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation(pos),
        (err) => {
          console.error("Geolocation error:", err);
          toast("Please enable location services for accurate reporting");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  // Notification permission state
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const syncPendingReports = async () => {
    const pending = reports.filter((r) => r.status === "pending");
    for (const report of pending) {
      try {
        await new Promise((res, rej) =>
          setTimeout(
            () =>
              Math.random() > 0.2 ? res(true) : rej(new Error("Network error")),
            1000 + Math.random() * 2000
          )
        );
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, status: "sent" } : r))
        );
        if (notificationsEnabled) {
          sendNotification(
            "Report Synced Successfully",
            `Your ${report.type} report has been sent to authorities`,
            "/placeholder.svg?height=64&width=64"
          );
        }
        toast(`${report.type} report successfully sent`);
      } catch {
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  retryCount: r.retryCount + 1,
                  status: r.retryCount >= 3 ? "failed" : "pending",
                }
              : r
          )
        );
        if (report.retryCount >= 3) {
          if (notificationsEnabled) {
            sendNotification(
              "Report Sync Failed",
              `Failed to send ${report.type} report after multiple attempts`,
              "/placeholder.svg?height=64&width=64"
            );
          }
          toast(`Failed to send ${report.type} report after multiple attempts`);
        }
      }
    }
  };

  // Auto‐sync when back online
  useEffect(() => {
    // if (networkInfo.online && reports.some((r) => r.status === "pending")) {
    //   const t = setTimeout(syncPendingReports, 2000);
    //   return () => clearTimeout(t);
    // }
     if (networkInfo.online && reports.some((r) => r.status === "pending")) {
         syncPendingReports()
       }
  }, [networkInfo.online, reports]);

  const removePhoto = (idx: number) =>
    setCapturedPhotos((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.severity || !formData.description) {
      toast("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    const newReport: DisasterReport = {
      id: Date.now().toString(),
      type: formData.type,
      severity: formData.severity,
      description: formData.description,
      photos: capturedPhotos,
      location: {
        latitude: currentLocation?.coords.latitude || 0,
        longitude: currentLocation?.coords.longitude || 0,
        address: "Location captured",
      },
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
    };
    setReports((p) => [newReport, ...p]);
    setFormData({ type: "", severity: "", description: "" });
    setCapturedPhotos([]);
    if (networkInfo.online && !networkInfo.saveData) {
      try {
        await new Promise((res, rej) =>
          setTimeout(
            () =>
              Math.random() > 0.1 ? res(true) : rej(new Error("Network error")),
            1000
          )
        );
        setReports((p) =>
          p.map((r) => (r.id === newReport.id ? { ...r, status: "sent" } : r))
        );
        toast("Your disaster report has been submitted successfully");
      } catch {
        toast("Report saved locally and will be sent when connection improves");
      }
    } else {
      if (networkInfo.online) {
        toast("Report saved locally due to data saver mode");
      } else {
        toast("Report saved locally and will be sent when online");
      }

      // toast({
      //   title: "Report queued",
      //   description: networkInfo.online
      //     ? "Report saved locally due to data saver mode"
      //     : "Report saved locally and will be sent when online",
      // });
    }
    setIsSubmitting(false);
  };

  // Simulated emergency alerts
  useEffect(() => {
    if (!notificationsEnabled) return;
    const alerts = [
      {
        message:
          "Severe weather warning in your area. Seek shelter immediately.",
        severity: "critical" as const,
      },
      {
        message: "Flash flood warning issued for your region.",
        severity: "high" as const,
      },
      {
        message: "Earthquake aftershocks possible in the next 24 hours.",
        severity: "medium" as const,
      },
      {
        message: "Emergency services are responding to reports in your area.",
        severity: "low" as const,
      },
    ];
    const iv = setInterval(() => {
      if (Math.random() > 0.7) {
        const a = alerts[Math.floor(Math.random() * alerts.length)];
        sendEmergencyAlert(a.message, a.severity);
      }
    }, 120000 + Math.random() * 180000);
    return () => clearInterval(iv);
  }, [notificationsEnabled]);

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Header
          showMap={showMap}
          setShowMap={setShowMap}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
        />
        <NetworkStatus networkInfo={networkInfo} pendingCount={pendingCount} />
        {showMap && (
          <MapSection reports={reports} currentLocation={currentLocation} />
        )}
        <div className="grid md:grid-cols-2 gap-6">
          <ReportForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            currentLocation={currentLocation}
            isSubmitting={isSubmitting}
            capturedPhotos={capturedPhotos}
            setCapturedPhotos={setCapturedPhotos}
            removePhoto={removePhoto}
          />
          <ReportsQueue reports={reports} />
        </div>
      </div>
    </div>
  );
}
