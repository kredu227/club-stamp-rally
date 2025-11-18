import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    if (!scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-code-full-region",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          setScanResult(decodedText);
          onScanSuccess(decodedText, decodedResult);
          html5QrcodeScanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner", error));
        },
        (errorMessage) => {
          // console.warn(`QR Scan Error: ${errorMessage}`);
          onScanFailure(errorMessage);
        }
      );
      scannerRef.current = html5QrcodeScanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear html5QrcodeScanner on unmount", error));
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>QR 코드 스캔</h2>
      <div id="qr-code-full-region" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      {scanResult && (
        <p style={{ marginTop: '20px', fontSize: '1.2em', fontWeight: 'bold' }}>
          스캔 결과: {scanResult}
        </p>
      )}
    </div>
  );
};

export default QrScanner;
