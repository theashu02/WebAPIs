"use client";
import type React from "react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  MapPin,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle,
  Map,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PhotoCapture } from "./components/PhotoCapture";
import { MapView } from "./components/MapView";
import { NotificationManager } from "./components/NotificationManager";
import { sendEmergencyAlert } from "./components/NotificationManager";
import { sendNotification } from "@/lib/notifications";
import { ModeToggle } from "@/components/ModeToggle";
const NetworkAlert = dynamic(() => import("./components/NetworkAlert"), {
  ssr: false,
});

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

  // Load reports from localStorage on mount
  useEffect(() => {
    const savedReports = localStorage.getItem("disaster-reports");
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  // Save reports to localStorage whenever reports change
  useEffect(() => {
    localStorage.setItem("disaster-reports", JSON.stringify(reports));
  }, [reports]);

  // Network status monitoring
  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      setNetworkInfo({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData,
      });
    };

    const handleOnline = () => {
      updateNetworkInfo();
      toast("Attempting to sync pending reports...");
      syncPendingReports();
    };

    const handleOffline = () => {
      updateNetworkInfo();
      toast("Reports will be queued for later sync");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial network info
    updateNetworkInfo();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast("Please enable location services for accurate reporting");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    }
  }, []);

  // Check notification permissions
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Background sync simulation (in a real app, this would use Service Workers)
  const syncPendingReports = async () => {
    const pendingReports = reports.filter(
      (report) => report.status === "pending"
    );

    for (const report of pendingReports) {
      try {
        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate network conditions
            if (Math.random() > 0.2) {
              // 80% success rate
              resolve(true);
            } else {
              reject(new Error("Network error"));
            }
          }, 1000 + Math.random() * 2000);
        });

        // Update report status to sent
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id ? { ...r, status: "sent" as const } : r
          )
        );

        // Send success notification
        if (notificationsEnabled) {
          // sendNotification(
          //   "Report Synced Successfully",
          //   `Your ${report.type} report has been sent to authorities`,
          //   "/placeholder.svg?height=64&width=64"
          // );
          // after (1 title + 1 options arg):
          sendNotification("Report Synced Successfully", {
            body: `Your ${report.type} report has been sent to authorities`,
            icon: "/placeholder.svg?height=64&width=64",
          });
        }

        toast(`${report.type} report successfully sent`);
      } catch (error) {
        // Update retry count and status
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  retryCount: r.retryCount + 1,
                  status:
                    r.retryCount >= 3
                      ? ("failed" as const)
                      : ("pending" as const),
                }
              : r
          )
        );

        if (report.retryCount >= 3) {
          // Send failure notification
          if (notificationsEnabled) {
            // sendNotification(
            //   "Report Sync Failed",
            //   `Failed to send ${report.type} report after multiple attempts`,
            //   "/placeholder.svg?height=64&width=64"
            // );
            sendNotification("Report Sync Failed", {
              body: `Failed to send ${report.type} report after multiple attempts`,
              icon: "/placeholder.svg?height=64&width=64",
            });
          }

          toast(`Failed to send ${report.type} report after multiple attempts`);
        }
      }
    }
  };

  // Auto-sync when online
  useEffect(() => {
    if (networkInfo.online) {
      const pendingReports = reports.filter(
        (report) => report.status === "pending"
      );
      if (pendingReports.length > 0) {
        const timer = setTimeout(() => {
          syncPendingReports();
        }, 2000); // Wait 2 seconds after coming online

        return () => clearTimeout(timer);
      }
    }
  }, [networkInfo.online, reports]);

  const removePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

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
      photos: capturedPhotos, // Add this line
      location: {
        latitude: currentLocation?.coords.latitude || 0,
        longitude: currentLocation?.coords.longitude || 0,
        address: "Location captured",
      },
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
    };

    // Add to reports queue
    setReports((prev) => [newReport, ...prev]);

    // Reset form
    setFormData({ type: "", severity: "", description: "" });
    setCapturedPhotos([]);

    if (networkInfo.online && !networkInfo.saveData) {
      // Try to send immediately if online
      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.1) {
              // 90% success rate when online
              resolve(true);
            } else {
              reject(new Error("Network error"));
            }
          }, 1000);
        });

        setReports((prev) =>
          prev.map((r) =>
            r.id === newReport.id ? { ...r, status: "sent" } : r
          )
        );

        toast("Your disaster report has been submitted successfully");
      } catch (error) {
        toast("Report saved locally and will be sent when connection improves");
      }
    } else {
      if (networkInfo.online) {
        toast("Report saved locally and will be sent when online");
      } else {
        toast("Report saved locally due to data saver mode");
      }
    }

    setIsSubmitting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Sent
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  // Simulate emergency alerts (in a real app, this would come from a server)
  useEffect(() => {
    if (!notificationsEnabled) return;

    const simulateEmergencyAlerts = () => {
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

      // Send random alert every 2-5 minutes (for demo purposes)
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          // 30% chance
          const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
          sendEmergencyAlert(randomAlert.message, randomAlert.severity);
        }
      }, 120000 + Math.random() * 180000); // 2-5 minutes

      return () => clearInterval(interval);
    };

    const cleanup = simulateEmergencyAlerts();
    return cleanup;
  }, [notificationsEnabled]);

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 dark:bg-neutral-900">
      <div className="absolute right-10 top-10">
        <ModeToggle />
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8 dark:text-[#f4f4f4]" />
            <h1 className="text-3xl font-bold">Disaster Reporter</h1>
          </div>
          <p className="text-gray-600 dark:text-amber-100">
            Report hazards and disasters in your area
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
            <NotificationManager
              enabled={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
          </div>
        </div>

        {/* Network Status */}
        <NetworkAlert pendingCount={pendingCount} />

        {/* Map View */}
        {showMap && (
          <Card>
            <CardHeader>
              <CardTitle>Report Locations</CardTitle>
              <CardDescription>
                Interactive map showing all disaster reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapView
                reports={reports}
                currentLocation={currentLocation}
                onReportClick={(reportId) => {
                  // Scroll to report in queue
                  const element = document.getElementById(`report-${reportId}`);
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Report Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Report</CardTitle>
              <CardDescription>
                Report a disaster or hazard in your current location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Disaster Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="earthquake">Earthquake</SelectItem>
                      <SelectItem value="flood">Flood</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="landslide">Landslide</SelectItem>
                      <SelectItem value="storm">Storm</SelectItem>
                      <SelectItem value="infrastructure">
                        Infrastructure Damage
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor damage</SelectItem>
                      <SelectItem value="medium">
                        Medium - Moderate damage
                      </SelectItem>
                      <SelectItem value="high">
                        High - Significant damage
                      </SelectItem>
                      <SelectItem value="critical">
                        Critical - Life threatening
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the situation, damage, and any immediate dangers..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photos (Optional)</Label>
                  <PhotoCapture
                    photos={capturedPhotos}
                    onPhotosChange={setCapturedPhotos}
                    onRemovePhoto={removePhoto}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {currentLocation ? (
                    <span>
                      Location: {currentLocation.coords.latitude.toFixed(6)},{" "}
                      {currentLocation.coords.longitude.toFixed(6)}
                    </span>
                  ) : (
                    <span>Getting location...</span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !currentLocation}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reports Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Report Queue</CardTitle>
              <CardDescription>
                Your submitted reports and their sync status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No reports submitted yet
                  </p>
                ) : (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      id={`report-${report.id}`}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <span className="font-medium capitalize">
                            {report.type}
                          </span>
                          {getStatusBadge(report.status)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-medium">Severity:</span>
                          <Badge
                            variant="outline"
                            className={
                              report.severity === "critical"
                                ? "border-red-500 text-red-700"
                                : report.severity === "high"
                                ? "border-orange-500 text-orange-700"
                                : report.severity === "medium"
                                ? "border-yellow-500 text-yellow-700"
                                : "border-green-500 text-green-700"
                            }
                          >
                            {report.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-xs line-clamp-2">
                          {report.description}
                        </p>

                        {/* Photo thumbnails */}
                        {report.photos && report.photos.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {report.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo || "/placeholder.svg"}
                                alt={`Report photo ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border"
                              />
                            ))}
                            <div className="flex items-center text-xs text-gray-500">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {report.photos.length}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {report.location.latitude.toFixed(4)},{" "}
                            {report.location.longitude.toFixed(4)}
                          </span>
                        </div>
                        {report.status === "pending" &&
                          report.retryCount > 0 && (
                            <p className="text-xs text-yellow-600 mt-1">
                              Retry attempt: {report.retryCount}/3
                            </p>
                          )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
