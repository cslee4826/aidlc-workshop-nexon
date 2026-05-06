import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useCartStore } from '../stores/cartStore';

export default function OrderConfirmPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderNumber) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [orderNumber, navigate]);

  const handleOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/orders', {
        items: items.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
        })),
      });
      setOrderNumber(response.data.order_number);
      clearCart();
    } catch {
      setError('주문에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (orderNumber) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FF6B35, #FF8F65)', padding: 40 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '48px 32px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxWidth: 360, width: '100%' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2D3436', marginBottom: 8 }}>주문 완료!</h1>
          <p style={{ fontSize: 14, color: '#868E96', marginBottom: 20 }}>주문이 접수되었습니다</p>
          <div style={{ background: '#F8F9FA', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#868E96' }}>주문번호</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#FF6B35', marginTop: 4 }}>{orderNumber}</p>
          </div>
          <p style={{ fontSize: 13, color: '#ADB5BD' }}>{countdown}초 후 메뉴 화면으로 이동합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F1F3F5' }}>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', fontSize: 20, minWidth: 36, minHeight: 36, padding: 0 }}>←</button>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>주문 확인</h1>
      </div>

      {/* Order Items */}
      <div style={{ padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {items.map((item, idx) => (
            <div key={item.menuItem.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < items.length - 1 ? '1px solid #F8F9FA' : 'none' }}>
              <div>
                <span style={{ fontWeight: 500 }}>{item.menuItem.name}</span>
                <span style={{ color: '#868E96', marginLeft: 8, fontSize: 13 }}>x{item.quantity}</span>
              </div>
              <span style={{ fontWeight: 600 }}>{(item.menuItem.price * item.quantity).toLocaleString()}원</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, marginTop: 12, borderTop: '2px solid #F1F3F5' }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>총 금액</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#FF6B35' }}>{totalAmount().toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {error && <p style={{ color: '#FF6B35', textAlign: 'center', padding: '0 16px', fontSize: 14 }}>{error}</p>}

      {/* Bottom Buttons */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: '#fff', borderTop: '1px solid #F1F3F5', display: 'flex', gap: 10 }}>
        <button
          data-testid="order-back-button"
          onClick={() => navigate('/cart')}
          style={{ flex: 1, backgroundColor: '#F1F3F5', color: '#495057', padding: '16px', borderRadius: 12, fontSize: 15 }}
        >
          뒤로
        </button>
        <button
          data-testid="order-confirm-button"
          onClick={handleOrder}
          disabled={loading}
          style={{ flex: 2.5, backgroundColor: '#FF6B35', color: '#fff', padding: '16px', fontSize: 17, fontWeight: 700, borderRadius: 12, boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }}
        >
          {loading ? '주문 중...' : '주문 확정'}
        </button>
      </div>
    </div>
  );
}
