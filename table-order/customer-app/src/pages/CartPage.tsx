import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <span style={{ fontSize: 64, marginBottom: 16 }}>🛒</span>
        <p style={{ fontSize: 18, color: '#868E96', marginBottom: 20 }}>장바구니가 비어있습니다</p>
        <button
          data-testid="cart-go-menu-button"
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#FF6B35', color: '#fff', padding: '14px 32px', borderRadius: 12, fontSize: 16 }}
        >
          메뉴 보러가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F1F3F5' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', fontSize: 20, minWidth: 36, minHeight: 36, padding: 0 }}>←</button>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>장바구니</h1>
        <span style={{ marginLeft: 'auto', color: '#868E96', fontSize: 14 }}>{items.length}개 항목</span>
      </div>

      {/* Items */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.menuItem.id}
            data-testid={`cart-item-${item.menuItem.id}`}
            style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{item.menuItem.name}</p>
                <p style={{ color: '#FF6B35', fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                  {(item.menuItem.price * item.quantity).toLocaleString()}원
                </p>
              </div>
              <button
                data-testid={`cart-remove-${item.menuItem.id}`}
                onClick={() => removeItem(item.menuItem.id)}
                style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, background: '#F8F9FA', color: '#ADB5BD', fontSize: 16, borderRadius: 8, padding: 0 }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                data-testid={`cart-decrease-${item.menuItem.id}`}
                onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                style={{ width: 36, height: 36, minWidth: 36, background: '#F1F3F5', fontSize: 18, borderRadius: 8, color: '#495057', padding: 0 }}
              >
                −
              </button>
              <span style={{ fontSize: 16, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
              <button
                data-testid={`cart-increase-${item.menuItem.id}`}
                onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                style={{ width: 36, height: 36, minWidth: 36, background: '#FF6B35', fontSize: 18, borderRadius: 8, color: '#fff', padding: 0 }}
              >
                +
              </button>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#868E96' }}>
                @{item.menuItem.price.toLocaleString()}원
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Clear button */}
      <div style={{ padding: '0 16px' }}>
        <button
          data-testid="cart-clear-button"
          onClick={() => { if (confirm('장바구니를 비우시겠습니까?')) clearCart(); }}
          style={{ width: '100%', background: '#F8F9FA', color: '#868E96', padding: '12px', fontSize: 14, borderRadius: 10 }}
        >
          전체 삭제
        </button>
      </div>

      {/* Bottom Order Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: '#fff', borderTop: '1px solid #F1F3F5', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
        <button
          data-testid="cart-order-button"
          onClick={() => navigate('/order/confirm')}
          style={{ width: '100%', backgroundColor: '#FF6B35', color: '#fff', padding: '16px', fontSize: 17, fontWeight: 700, borderRadius: 14, boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }}
        >
          {totalAmount().toLocaleString()}원 주문하기
        </button>
      </div>
    </div>
  );
}
