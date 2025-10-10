
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum DeliveryStatus {
  PENDING_ASSIGNMENT = "pending_assignment",
  ASSIGNED = "assigned",
  PICKED_UP = "picked_up",
  DELIVERED = "delivered",
  FAILED = "failed",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  UPI = "upi",
  COD = "cod",
  WALLET = "wallet",
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  profilePicture?: string | null;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
  shops?: Shop[];
  orders?: Order[];
}

export interface Address {
  id: number;
  userId: number;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  user?: User;
  orders?: Order[];
}

// ---------- SHOP & PRODUCT MODELS ----------

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  products?: Product[];
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  brand?: string | null;
  image: string;
  netQty: string;
  outOfStock: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  inShops?: ShopInventory[];
  orderItems?: OrderItem[];
}

export interface Shop {
  id: number;
  userId: number;
  storeName: string;
  description?: string | null;
  storeBanner?: string | null;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryTime: number;
  owner?: User;
  inventory?: ShopInventory[];
  orders?: Order[];
}

export interface ShopInventory {
  id: number;
  shopId: number;
  productId: number;
  price: number;
  quantity: number;
  isAvailable: boolean;
  shop?: Shop;
  product?: Product;
}

// ---------- ORDER & PAYMENT MODELS ----------

export interface Order {
  id: number;
  userId: number;
  shopId: number;
  deliveryAddressId: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  shop?: Shop;
  address?: Address;
  items?: OrderItem[];
  delivery?: Delivery | null;
  payment?: Payment | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  pricePerUnit: number;
  order?: Order;
  product?: Product;
}

// ---------- DELIVERY MODELS ----------

export interface DeliveryAgent {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  vehicleNumber?: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  isAvailable: boolean;
  createdAt: string;
  deliveries?: Delivery[];
}

export interface Delivery {
  id: number;
  orderId: number;
  agentId?: number | null;
  deliveryStatus: DeliveryStatus;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  order?: Order;
  agent?: DeliveryAgent | null;
  distanceKm?: number | null;
  deliveryFee?: number | null;
}

// ---------- PAYMENT MODEL ----------

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  transactionId?: string | null;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  order?: Order;
}

// ---------- OPTIONAL: REVIEW MODEL (Future) ----------

export interface Review {
  id: number;
  userId: number;
  shopId?: number | null;
  productId?: number | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: User;
  shop?: Shop | null;
  product?: Product | null;
}
