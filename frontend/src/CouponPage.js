import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CouponPage.css';

function CouponPage({ studentId }) {
  const navigate = useNavigate();
  const [isUsed, setIsUsed] = useState(false);
  const [error, setError] = useState('');

  const handleUseCoupon = async () => {
    if (isUsed) return; // 이미 사용된 쿠폰은 다시 요청하지 않음

    try {
      const response = await fetch('/api/coupon/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();

      if (data.success) {
        setIsUsed(true);
        alert('쿠폰 사용이 완료되었습니다!');
        navigate('/main'); // 사용 후 메인 스탬프 페이지로 이동
      } else {
        setError(data.message || '쿠폰 사용에 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Coupon use error:', err);
    }
  };

  return (
    <div className="coupon-container">
      <div className="coupon-content">
        <h1 className="coupon-title"><b>맛있는 소떡소떡을 드세요!</b></h1>
        <div className="coupon-image-placeholder">
          <img src="/images/sotteok.jpeg" alt="맛있는 소떡소떡" className="sotteok-image" />
        </div>
        <p className="coupon-instruction">
          중앙현관으로 가서 학생회에게 이 화면을 보여주세요.
        </p>
        {error && <p className="error-message">{error}</p>}
        <button 
          onClick={handleUseCoupon} 
          className="coupon-button"
          disabled={isUsed}
        >
          {isUsed ? '사용 완료' : '쿠폰 사용 완료'}
        </button>
      </div>
    </div>
  );
}

export default CouponPage;
