import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/authStore';
import axios from 'axios';

interface OrderItem {
  id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

interface TableInfo {
  id: string;
  table_number: number;
  current_session_id: string | null;
  total_amount: number;
}

const statusLabels: Record<string, { text: string; bg: string; color: string }> = {
  pending: { text: '대기중', bg: '#FFF3E0', color: '#E65100' },
  preparing: { text: '준비중', bg: '#E3F2FD', color: '#1565C0' },
  completed: { text: '완료', bg: '#E8F5E9', color: '#2E7D32' },
};

export default function DashboardPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const { token, logout } = useAdminAuthStore();
  const navigate = useNavigate();
  const eventSourceRef = useRef<EventSource | null>(null);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTables = async () => {
    try {
      const res = await axios.get('/api/tables', { headers });
      setTables(res.data);
    } catch { /* ignore */ }
  };

  const fetchOrders = async (tableId: string) => {
    try {
      const res = await axios.get(`/api/orders?table_id=${tableId}`, { headers });
      setOrders(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchTables();
    const es = new EventSource(`/api/sse/orders?token=${token}`);
    es.onmessage = () => fetchTables();
    es.addEventListener('new_order', () => { fetchTables(); if (selectedTable) fetchOrders(selectedTable.id); });
    es.addEventListener('status_change', () => { fetchTables(); if (selectedTable) fetchOrders(selectedTable.id); });
    es.addEventListener('order_deleted', () => { fetchTables(); if (selectedTable) fetchOrders(selectedTable.id); });
    es.addEventListener('session_completed', () => { fetchTables(); setSelectedTable(null); });
    eventSourceRef.current = es;
    return () => { es.close(); };
  }, [token]);

  const handleTableClick = (table: TableInfo) => {
    if (table.current_session_id) {
      setSelectedTable(table);
      fetchOrders(table.id);
    }
  };

  const handleComplete = async (tableId: string) => {
    if (!confirm('테이블 이용을 완료하시겠습니까?\n주문 내역이 과거 이력으로 이동됩니다.')) return;
    try {
      await axios.post(`/api/tables/${tableId}/complete`, {}, { headers });
      fetchTables();
      setSelectedTable(null);
      setOrders([]);
    } catch (err: any) {
      alert(err.response?.data?.detail || '처리에 실패했습니다');
    }
  };

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'preparing' : currentStatus === 'preparing' ? 'completed' : null;
    if (!nextStatus) return;
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: nextStatus }, { headers });
      if (selectedTable) fetchOrders(selectedTable.id);
      fetchTables();
    } catch (err: any) {
      alert(err.response?.data?.detail || '상태 변경에 실패했습니다');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/orders/${orderId}`, { headers });
      if (selectedTable) fetchOrders(selectedTable.id);
      fetchTables();
    } catch (err: any) {
      alert(err.response?.data?.detail || '삭제에 실패했습니다');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>주문 대시보드</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button data-testid="dashboard-menu-mgmt" onClick={() => navigate('/menus')} style={{ backgroundColor: '#1976D2', color: '#fff' }}>메뉴 관리</button>
          <button onClick={() => navigate('/sales')} style={{ backgroundColor: '#4CAF50', color: '#fff' }}>매출 현황</button>
          <button data-testid="dashboard-logout" onClick={logout} style={{ backgroundColor: '#eee', color: '#333' }}>로그아웃</button>
        </div>
      </div>

      {/* Table Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {tables.map((table) => (
          <div
            key={table.id}
            data-testid={`table-card-${table.table_number}`}
            onClick={() => handleTableClick(table)}
            style={{
              background: table.current_session_id ? '#fff' : '#f9f9f9',
              borderRadius: 12,
              padding: 16,
              border: selectedTable?.id === table.id ? '2px solid #1976D2' : table.current_session_id ? '2px solid #4CAF50' : '1px solid #e0e0e0',
              cursor: table.current_session_id ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16 }}>테이블 {table.table_number}</h3>
              {table.current_session_id && <span style={{ fontSize: 8, background: '#4CAF50', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>이용중</span>}
            </div>
            <p style={{ fontWeight: 'bold', color: '#4CAF50', fontSize: 18, marginTop: 8 }}>
              {table.total_amount.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>

      {tables.length === 0 && <p style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>등록된 테이블이 없습니다</p>}

      {/* Order Detail Panel */}
      {selectedTable && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>테이블 {selectedTable.table_number} 주문 내역</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                data-testid={`table-complete-${selectedTable.table_number}`}
                onClick={() => handleComplete(selectedTable.id)}
                style={{ backgroundColor: '#FF9800', color: '#fff', fontSize: 13, padding: '8px 14px' }}
              >
                이용 완료
              </button>
              <button onClick={() => setSelectedTable(null)} style={{ backgroundColor: '#eee', color: '#333', fontSize: 13, padding: '8px 14px' }}>닫기</button>
            </div>
          </div>

          {orders.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>주문이 없습니다</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => {
                const status = statusLabels[order.status] || statusLabels.pending;
                return (
                  <div key={order.id} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 'bold', fontSize: 14 }}>#{order.order_number}</span>
                        <span style={{ background: status.bg, color: status.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{status.text}</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#999' }}>{new Date(order.created_at).toLocaleTimeString('ko-KR')}</span>
                    </div>

                    {/* Order Items */}
                    <div style={{ marginBottom: 10 }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', color: '#555' }}>
                          <span>{item.menu_name} × {item.quantity}</span>
                          <span>{item.subtotal.toLocaleString()}원</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: 8 }}>
                      <span style={{ fontWeight: 'bold', fontSize: 14 }}>{order.total_amount.toLocaleString()}원</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {order.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(order.id, order.status)}
                            style={{ backgroundColor: '#1976D2', color: '#fff', fontSize: 11, padding: '5px 10px', minHeight: 28, minWidth: 28 }}
                          >
                            {order.status === 'pending' ? '준비시작' : '완료처리'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          style={{ backgroundColor: '#ff5252', color: '#fff', fontSize: 11, padding: '5px 10px', minHeight: 28, minWidth: 28 }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
