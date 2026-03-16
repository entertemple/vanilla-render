import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface MirrorWebcamProps {
  mirrorEnabled: boolean;
}

export default function MirrorWebcam({ mirrorEnabled }: MirrorWebcamProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const isDark = theme !== 'light';

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
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
      setCameraActive(true);
    } catch {
      // Fail silently — shader-only background remains
      setCameraActive(false);
    }
  }, []);

  const handleAllow = useCallback(() => {
    localStorage.setItem('temple_mirror_permission', 'granted');
    setShowPermissionPrompt(false);
    startCamera();
  }, [startCamera]);

  const handleDeny = useCallback(() => {
    localStorage.setItem('temple_mirror_permission', 'denied');
    setShowPermissionPrompt(false);
  }, []);

  useEffect(() => {
    if (!mirrorEnabled) {
      stopCamera();
      setShowPermissionPrompt(false);
      return;
    }

    const permission = localStorage.getItem('temple_mirror_permission');

    if (permission === 'granted') {
      startCamera();
    } else if (!permission) {
      setShowPermissionPrompt(true);
    }
    // If 'denied' — do nothing

    return () => {
      stopCamera();
    };
  }, [mirrorEnabled, startCamera, stopCamera]);

  if (!mirrorEnabled) return null;

  return (
    <>
      {/* Webcam layer */}
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
          display: cameraActive ? 'block' : 'none',
        }}
      />

      {/* Permission prompt */}
      {showPermissionPrompt && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 10,
            maxWidth: '280px',
            padding: '2rem',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            borderRadius: '16px',
          }}
        >
          {/* Camera icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            style={{
              margin: '0 auto 0.75rem',
              opacity: 0.45,
              color: isDark ? '#ffffff' : '#000000',
            }}
          >
            <rect x="2" y="5" width="16" height="11" rx="2" />
            <circle cx="10" cy="10.5" r="3" />
            <circle cx="14.5" cy="7.5" r="0.8" fill="currentColor" />
          </svg>

          {/* Line 1 */}
          <p
            style={{
              fontFamily: "'DM Sans', 'Inter', sans-serif",
              fontStyle: 'italic',
              fontWeight: 200,
              fontSize: '1rem',
              color: isDark ? '#ffffff' : '#000000',
            }}
          >
            Temple works as a mirror.
          </p>

          {/* Line 2–3 */}
          <p
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '0.72rem',
              opacity: 0.38,
              lineHeight: 1.7,
              marginTop: '0.5rem',
              color: isDark ? '#ffffff' : '#000000',
            }}
          >
            Your camera is never recorded or stored.
            <br />
            It exists only while you are here.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
            <button
              onClick={handleAllow}
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                padding: '0.5rem 1.25rem',
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#ffffff' : '#000000',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Allow
            </button>
            <button
              onClick={handleDeny}
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                padding: '0.5rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
              }}
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
