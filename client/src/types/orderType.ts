export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "OUT"
  | "CANCELLED";

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string;
    netQty: string;
  };
}

export interface Order {
  id: number;
  shopId: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  address: {
    addressLine1: string;
    city: string;
  };
  shop?: {
    id: number;
    storeName: string;
    storeBanner?: string;
  };
  items: OrderItem[];
}
