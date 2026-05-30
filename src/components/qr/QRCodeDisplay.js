"use client";

import { QRCodeCanvas } from "qrcode.react";

export function QRCodeDisplay({ value, size = 200 }) {
  if (!value) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="qr-container">
        <QRCodeCanvas
          value={value}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
    </div>
  );
}
