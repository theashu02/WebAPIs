"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, MapPin, ImageIcon } from "lucide-react";

interface DisasterReport {
  id: string;
  type: string;
  severity: string;
  description: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  status: "pending" | "sent" | "failed";
  retryCount: number;
}

interface ReportItemProps {
  report: DisasterReport;
}

export default function ReportItem({ report }: ReportItemProps) {
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

  return (
    <div id={`report-${report.id}`} className="border rounded-lg p-3 space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(report.status)}
          <span className="font-medium capitalize">{report.type}</span>
          {getStatusBadge(report.status)}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(report.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Details */}
      <div className="text-sm">
        {/* Severity */}
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

        {/* Description */}
        <p className="text-gray-600 text-xs line-clamp-2">
          {report.description}
        </p>

        {/* Photos */}
        {report.photos.length > 0 && (
          <div className="flex gap-1 mt-2">
            {report.photos.map((photo, i) => (
              <img
                key={i}
                src={photo || "/placeholder.svg"}
                alt={`Report photo ${i + 1}`}
                className="w-12 h-12 object-cover rounded border"
              />
            ))}
            <div className="flex items-center text-xs text-gray-500">
              <ImageIcon className="h-3 w-3 mr-1" />
              {report.photos.length}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>
            {report.location.latitude.toFixed(4)},{" "}
            {report.location.longitude.toFixed(4)}
          </span>
        </div>

        {/* Retry */}
        {report.status === "pending" && report.retryCount > 0 && (
          <p className="text-xs text-yellow-600 mt-1">
            Retry attempt: {report.retryCount}/3
          </p>
        )}
      </div>
    </div>
  );
}
