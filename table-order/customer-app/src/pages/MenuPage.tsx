import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useCartStore } from '../stores/cartStore';
import type { Category, MenuItem } from '../types';

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menusByCategory, setMenusByCategory] = useState<Record<string, MenuItem[]>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const { addItem, totalAmount, totalItems } = useCartStore();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const isScrollingByClick = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      const catRes = await apiClient.get('/categories');
      const cats: Category[] = catRes.data;
      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0].id);

      // Load all menus
      const menuRes = await apiClient.get('/menus');
      const allMenus: MenuItem[] = menuRes.data;

      // Also load menus without category filter to get all
      const grouped: Record<string, MenuItem[]> = {};
      for (const cat of cats) {
        const res = await apiClient.get(`/menus?category_id=${cat.id}`);
        grouped[cat.id] = res.data;
      }
      setMenusByCategory(grouped);
    };
    loadData();
  }, []);

  // Scroll spy: update active category based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingByClick.current) return;

      const headerHeight = 120; // sticky header + tabs height
      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i];
        const el = sectionRefs.current[cat.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerHeight + 10) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    isScrollingByClick.current = true;
    const el = sectionRefs.current[catId];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
      setTimeout(() => { isScrollingByClick.current = false; }, 800);
    }
  };

  const handleAddToCart = (menu: MenuItem) => {
    addItem(menu);
    setToast(`${menu.name} 추가됨`);
    setSelectedMenu(null);
    setTimeout(() => setToast(''), 1500);
  };

  return (
    <div style={{ paddingBottom: 90, minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #F1F3F5',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>🍽️ 메뉴</h1>
        <button
          data-testid="menu-orders-button"
          onClick={() => navigate('/orders')}
          style={{ background: '#F1F3F5', color: '#495057', padding: '8px 14px', fontSize: 13, borderRadius: 8 }}
        >
          주문내역
        </button>
      </div>

      {/* Category Tabs */}
      <div
        ref={tabsRef}
        data-testid="menu-category-tabs"
        style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '12px 16px',
          gap: 8,
          background: '#fff',
          borderBottom: '1px solid #F1F3F5',
          position: 'sticky',
          top: 57,
          zIndex: 15,
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            data-testid={`category-tab-${cat.id}`}
            onClick={() => scrollToCategory(cat.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeCategory === cat.id ? '#FF6B35' : '#F8F9FA',
              color: activeCategory === cat.id ? '#fff' : '#495057',
              whiteSpace: 'nowrap',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: activeCategory === cat.id ? 700 : 500,
              border: activeCategory === cat.id ? 'none' : '1px solid #E9ECEF',
              transition: 'all 0.2s',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* All Categories with Sections */}
      {categories.map((cat) => (
        <div
          key={cat.id}
          ref={(el) => { sectionRefs.current[cat.id] = el; }}
          style={{ padding: '16px 16px 0' }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#2D3436' }}>
            {cat.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
            {(menusByCategory[cat.id] || []).map((menu) => (
              <div
                key={menu.id}
                data-testid={`menu-card-${menu.id}`}
                className="animate-fade-in"
                onClick={() => setSelectedMenu(menu)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '100%',
                  height: 130,
                  background: menu.image_url ? `url(${menu.image_url}) center/cover` : 'linear-gradient(135deg, #FFF0EB, #FFE0D3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!menu.image_url && <span style={{ fontSize: 40 }}>🍴</span>}
                </div>
                <div style={{ padding: '12px 14px 14px' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#2D3436' }}>{menu.name}</h3>
                  {menu.description && (
                    <p style={{ fontSize: 12, color: '#868E96', marginBottom: 8, lineHeight: 1.3 }}>
                      {menu.description.length > 20 ? menu.description.slice(0, 20) + '...' : menu.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#FF6B35' }}>
                      {menu.price.toLocaleString()}원
                    </span>
                    <button
                      data-testid={`add-to-cart-${menu.id}`}
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(menu); }}
                      style={{
                        width: 36, height: 36, minWidth: 36, minHeight: 36,
                        borderRadius: '50%', backgroundColor: '#FF6B35', color: '#fff',
                        fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Menu Detail Modal */}
      {selectedMenu && (
        <div
          onClick={() => setSelectedMenu(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-up"
            style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto' }}
          >
            <div style={{
              width: '100%', height: 240,
              background: selectedMenu.image_url ? `url(${selectedMenu.image_url}) center/cover` : 'linear-gradient(135deg, #FFF0EB, #FFE0D3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              {!selectedMenu.image_url && <span style={{ fontSize: 64 }}>🍴</span>}
              <button
                onClick={() => setSelectedMenu(null)}
                style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, minWidth: 36, minHeight: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 18, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '24px 20px 32px' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{selectedMenu.name}</h2>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#FF6B35', marginBottom: 16 }}>{selectedMenu.price.toLocaleString()}원</p>
              {selectedMenu.description && (
                <p style={{ fontSize: 15, color: '#495057', lineHeight: 1.6, marginBottom: 24 }}>{selectedMenu.description}</p>
              )}
              <button
                data-testid={`modal-add-to-cart-${selectedMenu.id}`}
                onClick={() => handleAddToCart(selectedMenu)}
                style={{ width: '100%', backgroundColor: '#FF6B35', color: '#fff', padding: '16px', fontSize: 17, fontWeight: 700, borderRadius: 14, boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }}
              >
                장바구니에 담기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="animate-slide-up" style={{
          position: 'fixed', bottom: totalItems() > 0 ? 80 : 20, left: '50%', transform: 'translateX(-50%)',
          background: '#2D3436', color: '#fff', padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 500, zIndex: 100,
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Floating Cart Bar */}
      {totalItems() > 0 && (
        <div
          data-testid="cart-floating-bar"
          className="animate-slide-up"
          onClick={() => navigate('/cart')}
          style={{
            position: 'fixed', bottom: 16, left: 16, right: 16,
            background: '#FF6B35', color: '#fff', padding: '16px 24px', borderRadius: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,107,53,0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🛒</span>
            <span style={{ fontWeight: 600 }}>장바구니 {totalItems()}개</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17 }}>{totalAmount().toLocaleString()}원</span>
        </div>
      )}
    </div>
  );
}
