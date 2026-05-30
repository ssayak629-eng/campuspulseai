"use client";
// modify to check git part 2
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
  const [isFocused, setIsFocused] = useState(false);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let html5QrCode;

    async function startCamera() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        // Ensure element exists in DOM
        const element = document.getElementById("qr-scanner-element");
        if (!element) return;

        // 1. Get available cameras (this automatically prompts browser camera permission)
        const cameras = await Html5Qrcode.getCameras();

        if (!mountedRef.current) return;

        if (!cameras || cameras.length === 0) {
          throw new Error("No cameras found on this device.");
        }

        setHasPermission(true);

        // 2. Select appropriate camera
        // Try to find a back/rear/environment camera first
        let selectedCamera = cameras[0];
        for (const camera of cameras) {
          const label = camera.label.toLowerCase();
          if (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment") ||
            label.includes("dir back")
          ) {
            selectedCamera = camera;
            break;
          }
        }

        // 3. Initialize Html5Qrcode
        html5QrCode = new Html5Qrcode("qr-scanner-element");
        scannerRef.current = html5QrCode;

        // Try to start scanning with the back camera (environment) as default
        // Request enhanced camera capabilities for better low-quality image handling
        const constraints = {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          video: {
            focusMode: "continuous",
            torch: false,
            whiteBalanceMode: "continuous",
            exposureMode: "continuous",
            colorTemperature: { ideal: 6500 },
          }
        };

        await html5QrCode.start(
          constraints,
          {
            fps: 30, // Higher FPS for better low-light and low-quality image handling
            qrbox: (width, height) => {
              // Larger scanning area to capture QR codes better
              const size = Math.min(width, height) * 0.8;
              return { width: Math.max(250, size), height: Math.max(250, size) };
            },
            aspectRatio: 1.0,
            disableFlip: false,
            formatsToSupport: [
              Html5Qrcode.SupportedFormats.QR_CODE,
            ],
            experimentalFeatures: {
              useBarkoderIfAvailable: true,
            },
          },
          (decodedText) => {
            if (mountedRef.current) {
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // Keep scanning, ignore normal frame errors
          }
        );

        // Configure additional decoders for better low-quality image support
        const QrcodeDecoderWorker = await import("html5-qrcode/esm/workers/qrcode_decoder_worker.js").catch(() => null);
        if (html5QrCode && typeof html5QrCode.getState === "function") {
          try {
            // Use more aggressive scanning with multi-format decoder
            const state = html5QrCode.getState();
            if (state && state.decoderInstance) {
              state.decoderInstance.setMediaBitMultiplier(2); // Boost signal strength for low quality
            }
          } catch (e) {
            // Silently handle if advanced configuration unavailable
          }
        }

        if (mountedRef.current) {
          setHasPermission(true);
          setIsScanning(true);
        }
      } catch (err) {
        console.error("Scanner startup error:", err);
        if (mountedRef.current) {
          setHasPermission(false);
          const errStr = err.toString();
          if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
            setErrorMsg("Camera permission was denied. Please allow access in your browser settings and refresh.");
          } else if (errStr.includes("NotFoundError") || errStr.includes("DevicesNotFound")) {
            setErrorMsg("No camera device was detected on your system.");
          } else {
            setErrorMsg(err.message || "Failed to start camera. Please verify permissions.");
          }
          if (onError) onError(err);
        }
      }
    }

    startCamera();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          scanner.stop()
            .then(() => {
              try {
                scanner.clear();
              } catch (e) {
                console.error("Error clearing scanner after stop:", e);
              }
            })
            .catch((err) => console.error("Error stopping scanner during cleanup:", err));
        } else {
          try {
            scanner.clear();
          } catch (e) {
            console.error("Error clearing idle scanner:", e);
          }
        }
      }
    };
  }, [onScan, onError]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleFocus = async () => {
    if (scannerRef.current && typeof scannerRef.current.getRunningTrackSettings === "function") {
      try {
        const settings = await scannerRef.current.getRunningTrackSettings();
        if (settings.focusMode === "continuous") {
          // Trigger a manual focus attempt
          const track = scannerRef.current.getRunningTrackCameraCapabilities?.();
          if (track && track.focusDistance) {
            setIsFocused(true);
            setTimeout(() => setIsFocused(false), 500);
          }
        }
      } catch (e) {
        console.log("Focus control not available on this device");
      }
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-gray-950 border border-white/10 shadow-2xl flex flex-col items-center justify-center">
      {/* Target scanning div */}
      <div
        id="qr-scanner-element"
        className="w-full h-full overflow-hidden rounded-2xl"
        style={{ position: "relative" }}
      />

      {/* Modern Scanning Overlay */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
          {/* Subtle darkened backdrop around scanning area */}
          <div className="absolute inset-0 bg-black/45" style={{
            clipPath: 'polygon(0% 0%, 0% 100%, 15% 100%, 15% 15%, 85% 15%, 85% 85%, 15% 85%, 15% 100%, 100% 100%, 100% 0%)'
          }} />

          {/* Scanner Box frame */}
          <div className="relative w-[70%] aspect-square border border-white/10 rounded-xl flex items-center justify-center">
            {/* Corner highlights */}
            <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-md animate-pulse" />
            <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-md animate-pulse" />
            <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-md animate-pulse" />
            <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-md animate-pulse" />

            {/* Glowing moving laser line */}
            <div className="absolute w-[92%] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-scan" />
          </div>

          <p className="absolute bottom-6 text-[11px] text-cyan-200 font-medium tracking-wide bg-black/85 px-4 py-1.5 rounded-full border border-cyan-500/20 backdrop-blur-md">
            Align QR Code inside the frame
          </p>

          {/* Focus button for low quality images */}
          <button
            onClick={handleFocus}
            className={`absolute bottom-20 px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${isFocused
              ? "bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/50"
              : "bg-cyan-500/30 text-cyan-200 hover:bg-cyan-500/50"
              } border border-cyan-400/50`}
          >
            📍 Focus
          </button>
        </div>
      )}

      {/* Loading State */}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20 p-6 text-center">
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
