import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function SetupPage() {
  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(storeId, parseInt(tableNumber), password);
    } catch {
      setError('로그인에 실패했습니다. 정보를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = storeId && tableNumber && password;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: '#fff',
        borderRadius: 24,
        padding: '40px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🍽️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2D3436' }}>테이블 설정</h1>
          <p style={{ fontSize: 14, color: '#868E96', marginTop: 4 }}>주문을 시작하려면 정보를 입력하세요</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            data-testid="setup-store-id"
            placeholder="매장 식별자"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          />
          <input
            data-testid="setup-table-number"
            type="number"
            placeholder="테이블 번호"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <input
            data-testid="setup-password"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p style={{ color: '#FF6B35', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>
          )}
          <button
            data-testid="setup-submit-button"
            type="submit"
            disabled={!isValid || loading}
            style={{
              marginTop: 8,
              backgroundColor: isValid ? '#FF6B35' : '#DEE2E6',
              color: isValid ? '#fff' : '#ADB5BD',
              padding: '14px',
              fontSize: 17,
              fontWeight: 700,
              borderRadius: 12,
            }}
          >
            {loading ? '연결 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
