"use client"
import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { MapView } from "./MapView"

interface MapSectionProps {
  reports: Array<{ id: string }>
  currentLocation: GeolocationPosition | null
}

export default function MapSection({
  reports,
  currentLocation,
}: MapSectionProps) {
  return (
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
            const el = document.getElementById(`report-${reportId}`)
            el?.scrollIntoView({ behavior: "smooth" })
          }}
        />
      </CardContent>
    </Card>
  )
}