"use client";

import { useEffect, useRef, useState } from "react";

/**
 * QR Scanner component using html5-qrcode.
 * Dynamically imported to avoid SSR issues.
 */
export function QRScanner({ onScan, onError }) {
  const containerRef = useRef(null);
  const scannerRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let html5QrCode;

    async function startScanner() {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      html5QrCode = new Html5QrcodeScanner(
        "qr-scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        false
      );

      html5QrCode.render(
        (decodedText) => {
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (camera frames without QR)
          if (onError && !errorMessage.includes("No MultiFormat")) {
            onError(errorMessage);
          }
        }
      );

      scannerRef.current = html5QrCode;
      setStatus("ready");
    }

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan, onError]);

  return (
    <div>
      {status === "loading" && (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          Initializing camera...
        </div>
      )}
      <div
        id="qr-scanner-container"
        ref={containerRef}
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      />
      <style jsx global>{`
        #qr-scanner-container video {
          border-radius: 12px !important;
        }
        #qr-scanner-container img {
          display: none !important;
        }
        #qr-scanner-container #qr-shaded-region {
          border: 4px solid rgba(99,102,241,0.8) !important;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
