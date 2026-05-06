import { useState } from 'react';
import { useAdminAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [storeId, setStoreId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(storeId, username, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ width: 360, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: 22, marginBottom: 24, textAlign: 'center' }}>관리자 로그인</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input data-testid="admin-login-store-id" placeholder="매장 식별자" value={storeId} onChange={(e) => setStoreId(e.target.value)} />
          <input data-testid="admin-login-username" placeholder="사용자명" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input data-testid="admin-login-password" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
          <button
            data-testid="admin-login-submit"
            type="submit"
            disabled={!storeId || !username || !password || loading}
            style={{ backgroundColor: '#1976D2', color: '#fff', padding: '12px', fontSize: 16, marginTop: 8 }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>
    </div>
  );
}
