"use client";

import { useEffect, useRef, useState } from "react";

/**
 * QR Scanner component using html5-qrcode.
 * Dynamically imported to avoid SSR issues.
 * Requests camera permission immediately and begins scanning.
 */
export function QRScanner({ onScan, onError }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode;
    let isActive = true;

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        
        // Ensure the element is mounted
        const element = document.getElementById("qr-scanner-element");
        if (!element) return;

        html5QrCode = new Html5Qrcode("qr-scanner-element");
        scannerRef.current = html5QrCode;

        // Try to start scanning with the back camera (environment) as default
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: Math.max(200, size), height: Math.max(200, size) };
            },
          },
          (decodedText) => {
            if (isActive) {
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // Ignore scan errors (normal when camera frame has no QR code)
          }
        );

        if (isActive) {
          setHasPermission(true);
          setIsScanning(true);
        }
      } catch (err) {
        console.error("Camera init error:", err);
        if (isActive) {
          setHasPermission(false);
          // Standard browser permission denied or camera not found
          const friendlyMessage = err.toString().includes("NotAllowedError")
            ? "Camera permission was denied. Please allow camera access in your browser settings to continue."
            : "No active camera found or camera access was blocked. Please verify permissions and try again.";
          setErrorMsg(friendlyMessage);
          if (onError) onError(err);
        }
      }
    }

    initScanner();

    return () => {
      isActive = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          scanner.stop()
            .then(() => scanner.clear())
            .catch((err) => console.error("Error stopping scanner:", err));
        }
      }
    };
  }, [onScan, onError]);

  const handleRetry = () => {
    setHasPermission(null);
    setErrorMsg("");
    // Hard refresh or restart scanning state
    window.location.reload();
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-gray-950/80 border border-white/10 shadow-2xl flex flex-col items-center justify-center">
      {/* Target scanning container for html5-qrcode */}
      <div id="qr-scanner-element" className="absolute inset-0 w-full h-full object-cover" />

      {/* Modern Scanning Overlay */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
          {/* Darkened outer region */}
          <div className="absolute inset-0 bg-black/40" style={{
            clipPath: 'polygon(0% 0%, 0% 100%, 15% 100%, 15% 15%, 85% 15%, 85% 85%, 15% 85%, 15% 100%, 100% 100%, 100% 0%)'
          }} />

          {/* Scanner Box frame */}
          <div className="relative w-[70%] aspect-square border-2 border-indigo-500/20 rounded-xl flex items-center justify-center">
            {/* Corner highlights */}
            <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-md" />
            <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-md" />
            <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-md" />
            <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-md" />

            {/* Glowing moving laser line */}
            <div className="absolute w-[92%] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-scan" />
          </div>

          <p className="absolute bottom-6 text-xs text-cyan-200 font-medium tracking-wide bg-black/70 px-4 py-1.5 rounded-full border border-cyan-500/20 backdrop-blur-md">
            Align QR Code inside the frame
          </p>
        </div>
      )}

      {/* Requesting Permission / Loading State */}
      {hasPermission === null && !errorMsg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20 p-6 text-center">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Requesting Camera Access</h3>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            Please approve the browser camera permission request to scan event tickets.
          </p>
        </div>
      )}

      {/* Error/Denied State */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/95 z-20 p-6 text-center">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">
            📷
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Camera Access Required</h3>
          <p className="text-red-300 text-xs mb-6 px-4 leading-relaxed max-w-xs">
            {errorMsg}
          </p>
          <button
            onClick={handleRetry}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition duration-150 shadow-lg shadow-indigo-500/25"
          >
            Retry Camera Access
          </button>
        </div>
      )}

      {/* Scanning laser animation style */}
      <style jsx global>{`
        @keyframes scan-laser {
          0% { top: 4%; }
          50% { top: 96%; }
          100% { top: 4%; }
        }
        .animate-scan {
          animation: scan-laser 2.5s infinite linear;
        }
        /* Style video feed generated by html5-qrcode to fill the container perfectly */
        #qr-scanner-element video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem !important;
        }
      `}</style>
    </div>
  );
}
