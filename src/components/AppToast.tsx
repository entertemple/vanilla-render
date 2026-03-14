import { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

interface ToastProps {
  message: string;
  duration?: number;
}

function ToastComponent({ message, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), duration - 300);
    return () => clearTimeout(fadeTimer);
  }, [duration]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#0d0d0f',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '0.625rem 1.25rem',
        fontFamily: '"Geist Mono", monospace',
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.85)',
        zIndex: 999,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease-out',
        animation: visible ? 'toast-slide-in 250ms cubic-bezier(0.16,1,0.3,1) forwards' : undefined,
      }}
    >
      {message}
    </div>
  );
}

export function showToast(message: string, duration = 3000) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<ToastComponent message={message} duration={duration} />);

  setTimeout(() => {
    root.unmount();
    container.remove();
  }, duration + 100);
}
