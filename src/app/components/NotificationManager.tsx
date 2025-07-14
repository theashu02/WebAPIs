"use client"
import { useState, useEffect } from "react"
import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface NotificationManagerProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function NotificationManager({ enabled, onToggle }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast("Your browser doesn't support notifications")
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === "granted") {
        onToggle(true)

        // Send test notification
        sendNotification(
          "Notifications Enabled",
          "You'll now receive updates about your disaster reports",
          "/placeholder.svg?height=64&width=64",
        )

        toast("You'll receive updates about your reports")
      } else {
        onToggle(false)
        toast("Please enable notifications in your browser settings")
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      toast("Failed to request notification permission")
    }
  }

  const toggleNotifications = () => {
    if (permission !== "granted") {
      requestPermission()
    } else {
      onToggle(!enabled)
      if(!enabled){
        toast("You'll receive updates about your reports")
      }
      else{
        toast("You won't receive notification updates")
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleNotifications}
      className="flex items-center gap-2 bg-transparent"
    >
      {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      {enabled ? "Notifications On" : "Enable Notifications"}
    </Button>
  )
}

// Utility function to send notifications
export function sendNotification(title: string, body: string, icon?: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: icon || "/placeholder.svg?height=64&width=64",
      badge: "/placeholder.svg?height=32&width=32",
      tag: "disaster-report",
      requireInteraction: false,
      silent: false,
    })

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }
  return null
}

// Emergency alert function
export function sendEmergencyAlert(message: string, severity: "low" | "medium" | "high" | "critical") {
  const severityConfig = {
    low: { icon: "🟢", requireInteraction: false },
    medium: { icon: "🟡", requireInteraction: false },
    high: { icon: "🟠", requireInteraction: true },
    critical: { icon: "🔴", requireInteraction: true },
  }

  const config = severityConfig[severity]

  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(`${config.icon} Emergency Alert`, {
      body: message,
      icon: "/placeholder.svg?height=64&width=64",
      badge: "/placeholder.svg?height=32&width=32",
      tag: `emergency-${severity}`,
      requireInteraction: config.requireInteraction,
      silent: false,
      vibrate: severity === "critical" ? [200, 100, 200, 100, 200] : [200, 100, 200],
    } as any)

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }
  return null
}
