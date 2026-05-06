import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/authStore';
import axios from 'axios';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category_id: string;
  sort_order: number;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
}

const emptyForm = { name: '', price: '', description: '', category_id: '', image_url: '' };

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const { token } = useAdminAuthStore();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    const [menuRes, catRes] = await Promise.all([
      axios.get('/api/admin/menus', { headers }),
      axios.get('/api/admin/categories', { headers }),
    ]);
    setMenus(menuRes.data);
    setCategories(catRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (menu: MenuItem) => {
    setEditingId(menu.id);
    setFormData({
      name: menu.name,
      price: String(menu.price),
      description: menu.description || '',
      category_id: menu.category_id,
      image_url: menu.image_url || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      price: parseInt(formData.price),
      description: formData.description || null,
      category_id: formData.category_id,
      image_url: formData.image_url || null,
    };

    try {
      if (editingId) {
        await axios.put(`/api/menus/${editingId}`, payload, { headers });
      } else {
        await axios.post('/api/menus', payload, { headers });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || '저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('메뉴를 삭제하시겠습니까?')) return;
    await axios.delete(`/api/menus/${id}`, { headers });
    fetchData();
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>메뉴 관리</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            data-testid="menu-mgmt-add"
            onClick={showForm ? cancelForm : openCreateForm}
            style={{ backgroundColor: showForm ? '#eee' : '#4CAF50', color: showForm ? '#333' : '#fff' }}
          >
            {showForm ? '취소' : '메뉴 추가'}
          </button>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#eee', color: '#333' }}>
            대시보드
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12, border: editingId ? '2px solid #1976D2' : '1px solid #e0e0e0' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: editingId ? '#1976D2' : '#333' }}>
            {editingId ? '메뉴 수정' : '새 메뉴 등록'}
          </h3>
          <input data-testid="menu-form-name" placeholder="메뉴명" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <input data-testid="menu-form-price" type="number" placeholder="가격 (1000~500000)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
          <input data-testid="menu-form-description" placeholder="설명 (선택)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <select data-testid="menu-form-category" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
            <option value="">카테고리 선택</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input data-testid="menu-form-image" placeholder="이미지 URL (선택)" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button data-testid="menu-form-submit" type="submit" style={{ flex: 1, backgroundColor: editingId ? '#1976D2' : '#4CAF50', color: '#fff' }}>
              {editingId ? '수정 저장' : '등록'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelForm} style={{ backgroundColor: '#eee', color: '#333' }}>
                취소
              </button>
            )}
          </div>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 8 }}>
        {menus.map((menu) => (
          <div key={menu.id} data-testid={`menu-item-${menu.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold' }}>{menu.name}</span>
                <span style={{ color: '#666', fontSize: 14 }}>{menu.price.toLocaleString()}원</span>
              </div>
              {menu.description && <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{menu.description}</p>}
              {menu.image_url && <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🖼 {menu.image_url}</p>}
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                data-testid={`menu-edit-${menu.id}`}
                onClick={() => openEditForm(menu)}
                style={{ backgroundColor: '#1976D2', color: '#fff', fontSize: 12, padding: '6px 12px' }}
              >
                수정
              </button>
              <button
                data-testid={`menu-delete-${menu.id}`}
                onClick={() => handleDelete(menu.id)}
                style={{ backgroundColor: '#ff5252', color: '#fff', fontSize: 12, padding: '6px 12px' }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {menus.length === 0 && <p style={{ padding: 20, textAlign: 'center', color: '#999' }}>등록된 메뉴가 없습니다</p>}
      </div>
    </div>
  );
}
