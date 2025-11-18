import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './QrScanner.css'; // 최소한의 비디오 스타일을 위해 CSS는 유지합니다.

const QrScanner = ({ onScanSuccess, onScanFailure }) => {
  const videoRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const html5QrCode = new Html5Qrcode(videoRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          const cameraId = cameras.find(camera => camera.facing === 'environment')?.id || cameras[0].id;
          
          await html5QrCode.start(
            cameraId,
            { fps: 10 }, // qrbox 옵션 제거: 라이브러리 자체 UI를 사용하지 않음
            (decodedText, decodedResult) => {
              onScanSuccess(decodedText, decodedResult);
              // 스캔 성공 시 스캐너를 즉시 중지합니다.
              if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error("QR 스캐너 중지 실패.", err));
              }
            },
            (errorMessage) => {
              // 스캔 중 발생하는 오류는 무시 (계속 스캔)
            }
          );
        } else {
          throw new Error("이 기기에서 카메라를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("QR 스캐너 시작 실패:", err);
        onScanFailure(err.message || "카메라를 시작할 수 없습니다.");
      }
    };

    startScanner();

    // 컴포넌트가 사라질 때 스캐너 정리
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("QR 스캐너 중지 실패.", err));
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="qr-scanner-container-v3">
      {/* 라이브러리가 이 video 태그를 사용하여 카메라 영상을 표시 */}
      <video id="qr-video-element" ref={videoRef} playsInline={true} className="qr-scanner-video"></video>
    </div>
  );
};

export default QrScanner;