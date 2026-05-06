import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/authStore';
import axios from 'axios';

interface DailySale {
  date: string;
  total_amount: number;
  order_count: number;
}

export default function SalesCalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [sales, setSales] = useState<DailySale[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailySale | null>(null);
  const { token } = useAdminAuthStore();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchSales();
  }, [year, month]);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`/api/tables/sales/daily?year=${year}&month=${month}`, { headers });
      setSales(res.data);
    } catch { /* ignore */ }
  };

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  // Calendar generation
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const getSaleForDay = (day: number): DailySale | undefined => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sales.find(s => s.date === dateStr);
  };

  const monthTotal = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const monthOrders = sales.reduce((sum, s) => sum + s.order_count, 0);

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>📅 매출 현황</h1>
        <button onClick={() => navigate('/')} style={{ backgroundColor: '#eee', color: '#333', fontSize: 13, padding: '8px 14px' }}>대시보드</button>
      </div>

      {/* Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#fff', borderRadius: 12, padding: '12px 16px' }}>
        <button onClick={prevMonth} style={{ background: '#f5f5f5', color: '#333', width: 40, height: 40, fontSize: 18, borderRadius: 8, padding: 0 }}>◀</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{year}년 {month}월</h2>
        <button onClick={nextMonth} style={{ background: '#f5f5f5', color: '#333', width: 40, height: 40, fontSize: 18, borderRadius: 8, padding: 0 }}>▶</button>
      </div>

      {/* Monthly Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, background: '#E8F5E9', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#2E7D32' }}>월 매출</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#2E7D32' }}>{monthTotal.toLocaleString()}원</p>
        </div>
        <div style={{ flex: 1, background: '#E3F2FD', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#1565C0' }}>총 주문</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1565C0' }}>{monthOrders}건</p>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: i === 0 ? '#ff5252' : i === 6 ? '#1976D2' : '#666', padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {week.map((day, di) => {
              if (!day) return <div key={di} />;
              const sale = getSaleForDay(day);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() + 1 && year === new Date().getFullYear();
              return (
                <div
                  key={di}
                  onClick={() => sale && setSelectedDay(sale)}
                  style={{
                    textAlign: 'center',
                    padding: '8px 2px',
                    borderRadius: 8,
                    cursor: sale ? 'pointer' : 'default',
                    background: isToday ? '#E3F2FD' : sale ? '#F1F8E9' : 'transparent',
                    border: isToday ? '2px solid #1976D2' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: di === 0 ? '#ff5252' : di === 6 ? '#1976D2' : '#333' }}>
                    {day}
                  </div>
                  {sale && (
                    <div style={{ fontSize: 10, color: '#4CAF50', fontWeight: 600, marginTop: 2 }}>
                      {sale.total_amount >= 10000 ? `${Math.floor(sale.total_amount / 10000)}만` : `${(sale.total_amount / 1000).toFixed(0)}천`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16 }}>{selectedDay.date}</h3>
            <button onClick={() => setSelectedDay(null)} style={{ background: '#eee', color: '#333', fontSize: 12, padding: '4px 10px', minHeight: 28 }}>닫기</button>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: '#666' }}>매출</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#4CAF50' }}>{selectedDay.total_amount.toLocaleString()}원</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#666' }}>주문 수</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1976D2' }}>{selectedDay.order_count}건</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
