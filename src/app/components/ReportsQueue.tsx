"use client"
import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import ReportItem from "./ReportItem"

interface ReportsQueueProps {
  reports: Array<{ id: string }>
}

export default function ReportsQueue({ reports }: ReportsQueueProps) {
  return (
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
            reports.map((r) => <ReportItem key={r.id} report={r as any} />)
          )}
        </div>
      </CardContent>
    </Card>
  )
}