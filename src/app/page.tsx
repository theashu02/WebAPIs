import { Button } from "@/components/ui/button";
import MapView from "./components/MapView";
import { NotificationManager } from "./components/NotificationManager";
import { PhotoCapture } from "./components/PhotoCapture";

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
