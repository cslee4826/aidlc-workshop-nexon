import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import type { Order } from '../types';

const statusConfig: Record<string, { text: string; bg: string; color: string }> = {
  pending: { text: '대기중', bg: '#FFF3E0', color: '#FF6B35' },
  preparing: { text: '준비중', bg: '#E3F2FD', color: '#1976D2' },
  completed: { text: '완료', bg: '#E8F5E9', color: '#388E3C' },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/orders').then((res) => setOrders(res.data));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F1F3F5' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', fontSize: 20, minWidth: 36, minHeight: 36, padding: 0 }}>←</button>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>주문 내역</h1>
      </div>

      <div style={{ padding: 16 }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: 48 }}>📋</span>
            <p style={{ fontSize: 16, color: '#868E96', marginTop: 12 }}>아직 주문 내역이 없습니다</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div
                  key={order.id}
                  data-testid={`order-card-${order.id}`}
                  style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>#{order.order_number}</span>
                    <span style={{
                      background: status.bg,
                      color: status.color,
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {status.text}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#ADB5BD', marginBottom: 10 }}>
                    {new Date(order.created_at).toLocaleString('ko-KR')}
                  </p>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '3px 0', color: '#495057' }}>
                      <span>{item.menu_name} × {item.quantity}</span>
                      <span>{item.subtotal.toLocaleString()}원</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #F1F3F5', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#FF6B35' }}>
                      {order.total_amount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
