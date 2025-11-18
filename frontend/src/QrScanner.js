import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './QrScanner.css';

const QrScanner = ({ onScanSuccess, onScanFailure }) => {
  const containerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || html5QrCodeRef.current) {
      return;
    }

    const html5QrCode = new Html5Qrcode(containerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        // 직접 후면 카메라를 사용하도록 제약 조건을 전달합니다.
        await html5QrCode.start(
          { facingMode: "environment" }, // ID 대신 제약 조건 객체를 전달
          { fps: 10 },
          (decodedText, decodedResult) => {
            onScanSuccess(decodedText, decodedResult);
            if (html5QrCodeRef.current?.isScanning) {
              html5QrCodeRef.current.stop().catch(err => console.error("스캐너 중지 실패.", err));
            }
          },
          (errorMessage) => { /* 무시 */ }
        );

        // 비디오 요소 스타일 강제 적용
        const videoElement = containerRef.current.querySelector('video');
        if (videoElement) {
          videoElement.style.width = '100%';
          videoElement.style.height = '100%';
          videoElement.style.objectFit = 'cover';
        }
      } catch (err) {
        console.error("QR 스캐너 시작 실패:", err);
        onScanFailure(err.message || "카메라를 시작할 수 없습니다. 새로고침 후 다시 시도해주세요.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("스캐너 중지 실패.", err));
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div id="qr-video-container" ref={containerRef} className="qr-scanner-container-v3"></div>
  );
};

export default QrScanner;