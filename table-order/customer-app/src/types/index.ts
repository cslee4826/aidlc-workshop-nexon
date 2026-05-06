export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category_id: string;
  sort_order: number;
  is_available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'preparing' | 'completed';
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

export interface TableAuth {
  storeIdentifier: string;
  tableNumber: number;
  password: string;
  accessToken: string;
  tableId: string;
}
