import { Button } from "@/components/ui/button";
import { MapView } from "./components/MapView";
import { NotificationManager } from "./components/NotificationManager";
import { PhotoCapture } from "./components/PhotoCapture";

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

export default function Home() {
  return (
    <div>
      {" "}
      <Button variant="destructive">Home</Button>
      <MapView />
      <NotificationManager />
      <PhotoCapture />
    </div>
  );
}
