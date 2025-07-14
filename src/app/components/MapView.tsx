"use client"

import { useEffect, useRef } from "react"
import type { DisasterReport } from "../page"

interface MapViewProps {
  reports: DisasterReport[]
  currentLocation: GeolocationPosition | null
  onReportClick: (reportId: string) => void
}

export function MapView({ reports, currentLocation, onReportClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map
        const map = L.map(mapRef.current).setView([40.7128, -74.006], 10) // Default to NYC

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map)

        mapInstanceRef.current = map

        // Set view to current location if available
        if (currentLocation) {
          map.setView([currentLocation.coords.latitude, currentLocation.coords.longitude], 13)

          // Add current location marker
          const currentLocationIcon = L.divIcon({
            html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>',
            iconSize: [16, 16],
            className: "current-location-marker",
          })

          L.marker([currentLocation.coords.latitude, currentLocation.coords.longitude], { icon: currentLocationIcon })
            .addTo(map)
            .bindPopup("Your current location")
        }
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [currentLocation])

  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return

      const L = (await import("leaflet")).default
      const map = mapInstanceRef.current

      // Clear existing report markers (keep current location)
      map.eachLayer((layer: any) => {
        if (layer.options && layer.options.reportId) {
          map.removeLayer(layer)
        }
      })

      // Add markers for each report
      reports.forEach((report) => {
        if (report.location.latitude && report.location.longitude) {
          const severityColors = {
            low: "#22c55e", // green
            medium: "#eab308", // yellow
            high: "#f97316", // orange
            critical: "#ef4444", // red
          }

          const statusIcons = {
            pending: "⏳",
            sent: "✅",
            failed: "❌",
          }

          const color = severityColors[report.severity as keyof typeof severityColors] || "#6b7280"
          const statusIcon = statusIcons[report.status as keyof typeof statusIcons] || "⏳"

          const markerIcon = L.divIcon({
            html: `
              <div style="
                background-color: ${color}; 
                width: 24px; 
                height: 24px; 
                border-radius: 50%; 
                border: 2px solid white; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
                font-weight: bold;
              ">
                ${statusIcon}
              </div>
            `,
            iconSize: [28, 28],
            className: "disaster-marker",
          })

          const marker = L.marker([report.location.latitude, report.location.longitude], {
            icon: markerIcon,
            reportId: report.id,
          }).addTo(map)

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; text-transform: capitalize;">
                ${report.type}
              </h3>
              <div style="margin-bottom: 8px;">
                <span style="
                  background-color: ${color}; 
                  color: white; 
                  padding: 2px 6px; 
                  border-radius: 4px; 
                  font-size: 12px;
                  text-transform: capitalize;
                ">
                  ${report.severity}
                </span>
                <span style="
                  margin-left: 8px;
                  padding: 2px 6px;
                  background-color: ${report.status === "sent" ? "#22c55e" : report.status === "failed" ? "#ef4444" : "#eab308"};
                  color: white;
                  border-radius: 4px;
                  font-size: 12px;
                  text-transform: capitalize;
                ">
                  ${report.status}
                </span>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.4;">
                ${report.description}
              </p>
              ${
                report.photos && report.photos.length > 0
                  ? `
                <div style="margin-bottom: 8px;">
                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    ${report.photos
                      .slice(0, 3)
                      .map(
                        (photo) => `
                      <img src="${photo}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                    `,
                      )
                      .join("")}
                    ${report.photos.length > 3 ? `<div style="width: 50px; height: 50px; background-color: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280;">+${report.photos.length - 3}</div>` : ""}
                  </div>
                </div>
              `
                  : ""
              }
              <div style="font-size: 12px; color: #6b7280;">
                ${new Date(report.timestamp).toLocaleString()}
              </div>
              <button 
                onclick="window.scrollToReport('${report.id}')"
                style="
                  margin-top: 8px;
                  padding: 4px 8px;
                  background-color: #3b82f6;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                "
              >
                View Details
              </button>
            </div>
          `

          marker.bindPopup(popupContent)

          // Handle marker click
          marker.on("click", () => {
            onReportClick(report.id)
          })
        }
      })
    }

    updateMarkers()
  }, [reports, onReportClick])

  // Global function for popup button
  useEffect(() => {
    ;(window as any).scrollToReport = (reportId: string) => {
      onReportClick(reportId)
    }

    return () => {
      delete (window as any).scrollToReport
    }
  }, [onReportClick])

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />

      <div ref={mapRef} className="w-full h-96 rounded-lg border" style={{ minHeight: "400px" }} />

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            <span>Low Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
            <span>Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span>Critical Severity</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>⏳ Pending • ✅ Sent • ❌ Failed</span>
          </div>
        </div>
      </div>
    </>
  )
}
