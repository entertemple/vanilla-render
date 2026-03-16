import { useRef, useEffect, useCallback } from 'react';

interface MirrorWebcamProps {
  mirrorEnabled: boolean;
}

export default function MirrorWebcam({ mirrorEnabled }: MirrorWebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Fail silently — shader-only background remains
    }
  }, []);

  useEffect(() => {
    if (!mirrorEnabled) {
      stopCamera();
      return;
    }

    const permission = localStorage.getItem('temple_mirror_permission');
    if (permission === 'granted') {
      startCamera();
    }
    // If no permission or denied — do nothing, shader-only

    return () => {
      stopCamera();
    };
  }, [mirrorEnabled, startCamera, stopCamera]);

  if (!mirrorEnabled) return null;

  const permission = localStorage.getItem('temple_mirror_permission');
  if (permission !== 'granted') return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="webcam-layer"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
