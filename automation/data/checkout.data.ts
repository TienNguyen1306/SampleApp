export interface CheckoutScenario {
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: 'cash' | 'card';
  description: string;
}

export interface MockOrderResponse {
  id: number;
  userId: number;
  items: Array<{ id: number; name: string; price: number; emoji: string; quantity: number }>;
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: 'cash' | 'card';
  paymentIntentId: string | null;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export const checkoutScenarios: CheckoutScenario[] = [
  {
    recipientName: 'Nguyễn Văn A',
    recipientPhone: '0912345678',
    address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM',
    paymentMethod: 'cash',
    description: 'cash on delivery',
  },
  {
    recipientName: 'Trần Thị B',
    recipientPhone: '0987654321',
    address: '456 Đường Nguyễn Huệ, Phường 1, Quận 1, TP. HCM',
    paymentMethod: 'card',
    description: 'card payment (mock)',
  },
];

export const incompleteFormScenarios = [
  {
    recipientName: '',
    recipientPhone: '',
    address: '',
    description: 'all fields empty',
  },
  {
    recipientName: 'Nguyễn Văn A',
    recipientPhone: '',
    address: '',
    description: 'only name filled',
  },
  {
    recipientName: 'Nguyễn Văn A',
    recipientPhone: '0912345678',
    address: '',
    description: 'address missing',
  },
];

export const mockProducts = [
  { id: 1, name: 'Áo thun nam', price: 199000, emoji: '👕', tag: 'Mới', category: 'Thời trang', stock: 50 },
  { id: 2, name: 'Giày sneaker', price: 599000, emoji: '👟', tag: 'Hot', category: 'Giày dép', stock: 30 },
];

export const mockOrder: MockOrderResponse = {
  id: 1,
  userId: 1,
  items: [{ id: 1, name: 'Áo thun nam', price: 199000, emoji: '👕', quantity: 1 }],
  recipientName: 'Nguyễn Văn A',
  recipientPhone: '0912345678',
  address: '123 Đường Lê Lợi, TP. HCM',
  paymentMethod: 'cash',
  paymentIntentId: null,
  totalPrice: 199000,
  status: 'confirmed',
  createdAt: new Date().toISOString(),
};

export interface E2ECheckoutScenario {
  description: string;
  credentials: { username: string; password: string };
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: 'cash' | 'card';
  expectedPaymentLabel: string;
}

export const e2eCheckoutScenarios: E2ECheckoutScenario[] = [
  {
    description: 'admin user - cash payment',
    credentials: { username: 'admin', password: 'password123' },
    recipientName: 'Nguyễn Văn A',
    recipientPhone: '0912345678',
    address: '123 Đường Lê Lợi, TP. HCM',
    paymentMethod: 'cash',
    expectedPaymentLabel: 'Tiền mặt',
  },
  {
    description: 'regular user - cash payment',
    credentials: { username: 'user', password: '123456' },
    recipientName: 'Trần Thị B',
    recipientPhone: '0987654321',
    address: '456 Đường Nguyễn Huệ, TP. HCM',
    paymentMethod: 'cash',
    expectedPaymentLabel: 'Tiền mặt',
  },
];

export const mockOrderHistory: MockOrderResponse[] = [
  mockOrder,
  {
    id: 2,
    userId: 1,
    items: [{ id: 2, name: 'Giày sneaker', price: 599000, emoji: '👟', quantity: 2 }],
    recipientName: 'Nguyễn Văn A',
    recipientPhone: '0912345678',
    address: '456 Đường Nguyễn Huệ, TP. HCM',
    paymentMethod: 'card',
    paymentIntentId: 'mock_pi_1234_secret_mock',
    totalPrice: 1198000,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
