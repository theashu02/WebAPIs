"use client"
import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { PhotoCapture } from "./PhotoCapture"

interface ReportFormProps {
  formData: {
    type: string
    severity: string
    description: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{ type: string; severity: string; description: string }>
  >
  handleSubmit: (e: React.FormEvent) => Promise<void>
  currentLocation: GeolocationPosition | null
  isSubmitting: boolean
  capturedPhotos: string[]
  setCapturedPhotos: React.Dispatch<React.SetStateAction<string[]>>
  removePhoto: (index: number) => void
}

export default function ReportForm({
  formData,
  setFormData,
  handleSubmit,
  currentLocation,
  isSubmitting,
  capturedPhotos,
  setCapturedPhotos,
  removePhoto,
}: ReportFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Report</CardTitle>
        <CardDescription>
          Report a disaster or hazard in your current location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Disaster Type */}
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

          {/* Severity */}
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
                <SelectItem value="medium">Medium - Moderate damage</SelectItem>
                <SelectItem value="high">High - Significant damage</SelectItem>
                <SelectItem value="critical">
                  Critical - Life threatening
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
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

          {/* Photos */}
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <PhotoCapture
              photos={capturedPhotos}
              onPhotosChange={setCapturedPhotos}
              onRemovePhoto={removePhoto}
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {currentLocation ? (
              <span>
                Location:{" "}
                {currentLocation.coords.latitude.toFixed(6)},{" "}
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
  )
}