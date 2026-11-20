export type MenuCategory = 'Salgados' | 'Lanches' | 'Bebidas' | 'Refeições' | 'Sobremesas';

export type IconKey = 'pastry' | 'sandwich' | 'beverage' | 'coffee' | 'water' | 'meal' | 'dessert';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  portion: string;
  desc: string;
  iconKey: IconKey;
  imageUrl?: string;
  available: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  portion: string;
}

export type PaymentMethod = 'Faturar na Aeronave' | 'PIX' | 'Cartão na Entrega';

export type OrderStatus = 'Enviado no WhatsApp' | 'Em Preparo' | 'Entregue na Aeronave';

export interface WhatsAppOrder {
  id: string;
  code: string;
  aircraftTail: string;
  requesterName: string;
  deliveryTime: string;
  hangarLocation: string;
  notes: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface HangarSettings {
  hangarName: string;
  whatsappNumber: string;
  greetingText: string;
  deliveryLeadMinutes: number;
  requirePin?: boolean;
  managementPin?: string;
}

export type AdminRole = 'admin' | 'manager';

export type CurrentAdminRole = 'owner' | AdminRole | null;

export interface AdminUser {
  email: string;
  displayName?: string;
  role: AdminRole;
  addedBy?: string;
  createdAt: string;
}

export interface AuthErrorDetails {
  code?: string;
  message: string;
  unauthorizedDomain?: string;
}
