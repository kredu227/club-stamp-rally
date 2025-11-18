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
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          const cameraId = cameras.find(camera => camera.facing === 'environment')?.id || cameras[0].id;
          
          await html5QrCode.start(
            cameraId,
            { fps: 10 },
            (decodedText, decodedResult) => {
              onScanSuccess(decodedText, decodedResult);
              if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error("스캐너 중지 실패.", err));
              }
            },
            (errorMessage) => { /* 무시 */ }
          );

          // 중요: 라이브러리가 video 요소를 생성한 후 스타일을 강제로 적용
          const videoElement = containerRef.current.querySelector('video');
          if (videoElement) {
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';
          }
        } else {
          throw new Error("카메라를 찾을 수 없습니다.");
        }
      } catch (err) {
        onScanFailure(err.message || "카메라를 시작할 수 없습니다.");
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
    // 이제 이 div는 라이브러리가 video 요소를 삽입할 컨테이너 역할을 합니다.
    <div id="qr-video-container" ref={containerRef} className="qr-scanner-container-v3"></div>
  );
};

export default QrScanner;
