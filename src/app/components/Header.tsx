"use client"
import React from "react"
import { AlertTriangle, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationManager } from "./NotificationManager"

interface HeaderProps {
  showMap: boolean
  setShowMap: (value: boolean) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
}

export default function Header({
  showMap,
  setShowMap,
  notificationsEnabled,
  setNotificationsEnabled,
}: HeaderProps) {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Disaster Reporter</h1>
      </div>
      <p className="text-gray-600">Report hazards and disasters in your area</p>
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
  )
}