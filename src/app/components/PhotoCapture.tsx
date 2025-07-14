// "use client";
// import type React from "react";
// import { useState, useRef } from "react";
// import { Camera, Upload, X, ImageIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";

// interface PhotoCaptureProps {
//   photos: string[];
//   onPhotosChange: (photos: string[]) => void;
//   onRemovePhoto: (index: number) => void;
// }

// export function PhotoCapture({
//   photos,
//   onPhotosChange,
//   onRemovePhoto,
// }: PhotoCaptureProps) {
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const startCamera = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "environment", // Use back camera on mobile
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//       });

//       setStream(mediaStream);
//       setIsCapturing(true);

//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//       alert("Unable to access camera. Please check permissions.");
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       setStream(null);
//     }
//     setIsCapturing(false);
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const context = canvas.getContext("2d");

//       if (context) {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         context.drawImage(video, 0, 0);

//         const photoData = canvas.toDataURL("image/jpeg", 0.8);
//         onPhotosChange([...photos, photoData]);
//         stopCamera();
//       }
//     }
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files) {
//       Array.from(files).forEach((file) => {
//         if (file.type.startsWith("image/")) {
//           const reader = new FileReader();
//           reader.onload = (e) => {
//             if (e.target?.result) {
//               onPhotosChange([...photos, e.target.result as string]);
//             }
//           };
//           reader.readAsDataURL(file);
//         }
//       });
//     }
//   };

//   return (
//     <div className="space-y-3">
//       {/* Photo capture controls */}
//       <div className="flex gap-2">
//         <Button
//           type="button"
//           variant="outline"
//           size="sm"
//           onClick={startCamera}
//           disabled={isCapturing}
//           className="flex items-center gap-2 bg-transparent"
//         >
//           <Camera className="h-4 w-4" />
//           Take Photo
//         </Button>

//         <Button
//           type="button"
//           variant="outline"
//           size="sm"
//           onClick={() => fileInputRef.current?.click()}
//           className="flex items-center gap-2"
//         >
//           <Upload className="h-4 w-4" />
//           Upload
//         </Button>

//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           multiple
//           onChange={handleFileUpload}
//           className="hidden"
//         />
//       </div>

//       {/* Camera view */}
//       {isCapturing && (
//         <Card className="p-4">
//           <div className="space-y-3">
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               className="w-full max-w-md mx-auto rounded-lg"
//             />
//             <div className="flex justify-center gap-2">
//               <Button onClick={capturePhoto} size="sm">
//                 Capture
//               </Button>
//               <Button onClick={stopCamera} variant="outline" size="sm">
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Hidden canvas for photo capture */}
//       <canvas ref={canvasRef} className="hidden" />

//       {/* Photo thumbnails */}
//       {photos.length > 0 && (
//         <div className="space-y-2">
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <ImageIcon className="h-4 w-4" />
//             <span>
//               {photos.length} photo{photos.length !== 1 ? "s" : ""} attached
//             </span>
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             {photos.map((photo, index) => (
//               <div key={index} className="relative group">
//                 <img
//                   src={photo || "/placeholder.svg"}
//                   alt={`Captured photo ${index + 1}`}
//                   className="w-full h-20 object-cover rounded border"
//                 />
//                 <Button
//                   type="button"
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => onRemovePhoto(index)}
//                   className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
//                 >
//                   <X className="h-3 w-3" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import type React from "react";
import { useState, useRef } from "react";
import { Camera, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PhotoCaptureProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  onRemovePhoto: (index: number) => void;
}

export function PhotoCapture({
  photos,
  onPhotosChange,
  onRemovePhoto,
}: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setIsCapturing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;            // allow autoplay
        videoRef.current.play().catch(() => {});  // start the stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const photoData = canvas.toDataURL("image/jpeg", 0.8);
        onPhotosChange([...photos, photoData]);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              onPhotosChange([...photos, e.target.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Photo capture controls */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startCamera}
          disabled={isCapturing}
          className="flex items-center gap-2 bg-transparent"
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Camera view */}
      {isCapturing && (
        <Card className="p-4">
          <div className="space-y-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md mx-auto rounded-lg"
            />
            <div className="flex justify-center gap-2">
              <Button onClick={capturePhoto} size="sm">
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon className="h-4 w-4" />
            <span>
              {photos.length} photo{photos.length !== 1 ? "s" : ""} attached
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Captured photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}