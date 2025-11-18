import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QrScanner.css';

const QrScanner = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    if (!scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-code-full-region",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          facingMode: 'environment' // 후면 카메라를 우선적으로 사용
        },
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
    <div className="qr-scanner-container">
      <div id="qr-code-full-region" className="qr-scanner-viewport"></div>
      <div className="qr-scanner-overlay">
        <div className="qr-scanner-guide">
          <div className="qr-scanner-corner top-left"></div>
          <div className="qr-scanner-corner top-right"></div>
          <div className="qr-scanner-corner bottom-left"></div>
          <div className="qr-scanner-corner bottom-right"></div>
        </div>
        <p className="qr-scanner-text">QR 코드를 사각형 안에 맞춰주세요</p>
      </div>
      {scanResult && (
        <p className="scan-result-text">
          스캔 완료!
        </p>
      )}
    </div>
  );
};

export default QrScanner;
