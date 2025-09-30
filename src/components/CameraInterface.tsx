import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, CameraOff, RotateCcw, Loader2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CameraInterfaceProps {
  onCapture: (imageData: string) => void;
  isAnalyzing: boolean;
}

export const CameraInterface: React.FC<CameraInterfaceProps> = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Get available cameras
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        // On mobile, prefer front camera
        if (isMobile) {
          const frontCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('front') || 
            device.label.toLowerCase().includes('user')
          );
          if (frontCamera) {
            setSelectedDevice(frontCamera.deviceId);
          }
        }
      })
      .catch(err => {
        console.error('Error enumerating devices:', err);
        toast({
          title: "Camera Error",
          description: "Could not access camera devices",
          variant: "destructive"
        });
      });
  }, [isMobile]);

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: isMobile ? 'user' : undefined
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to analyze your eyebags",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6 bg-gradient-subtle shadow-card">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Camera Setup</h2>
          <p className="text-muted-foreground">Position your face clearly in the camera or upload an image for accurate analysis</p>
        </div>

        {!isMobile && devices.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Camera</label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Choose camera" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="relative">
          <img
                  src="https://i.imgur.com/dWOD2QJ_d.webp?maxwidth=760&fidelity=grand"
                  alt="Overlay Filter"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/5 h-auto object-contain z-10 pointer-events-none"
                />
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full aspect-video bg-muted rounded-lg ${!isActive ? 'hidden' : ''}`}
          />
          
          {!isActive && (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Camera preview will appear here</p>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          {!isActive ? (
            <>
              <Button 
                onClick={startCamera}
                className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow"
                size="lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Start Camera
              </Button>
              <Button
                onClick={triggerFileUpload}
                disabled={isAnalyzing}
                variant="outline"
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Image
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={capturePhoto}
                disabled={isAnalyzing}
                className="bg-gradient-success text-success-foreground shadow-elegant"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Analyze Eyebags
                  </>
                )}
              </Button>
              
              <Button
                onClick={stopCamera}
                variant="secondary"
                size="lg"
              >
                <CameraOff className="mr-2 h-5 w-5" />
                Stop Camera
              </Button>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
};
