// -------------------------------------------------------------
// 🌍 ENUMS (matching your Prisma schema)
// -------------------------------------------------------------

export enum OrderStatus {
  pending = "pending",
  confirmed = "confirmed",
  preparing = "preparing",
  out_for_delivery = "out_for_delivery",
  delivered = "delivered",
  cancelled = "cancelled",
  failed = "failed",
}

export enum DeliveryStatus {
  pending_assignment = "pending_assignment",
  assigned = "assigned",
  picked_up = "picked_up",
  delivered = "delivered",
  failed = "failed",
}

export enum PaymentStatus {
  pending = "pending",
  completed = "completed",
  failed = "failed",
  refunded = "refunded",
}

export enum Unit {
  g = "g",
  kg = "kg",
  mg = "mg",
  lb = "lb",
  oz = "oz",
  ml = "ml",
  l = "l",
  cl = "cl",
  gal = "gal",
  pcs = "pcs",
  pack = "pack",
  box = "box",
  bottle = "bottle",
  can = "can",
  jar = "jar",
  bag = "bag",
  dozen = "dozen",
  pair = "pair",
  tray = "tray",
}

// -------------------------------------------------------------
// 👤 USER & ADDRESS MODELS
// -------------------------------------------------------------

export interface Address {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
}

// -------------------------------------------------------------
// 🏬 SHOP & INVENTORY MODELS
// -------------------------------------------------------------

export interface Shop {
  id: number;
  userId: number;
  storeName: string;
  description?: string;
  storeBanner?: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryTime: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  inventory?: ShopInventory[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  brand?: string;
  image: string;
  netQty?: number; 
  unit ?: Unit
  outOfStock: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  inShops?: ShopInventory[];
}

export interface ShopInventory {
  id: number;
  shopId: number;
  productId: number;
  price: number;
  quantity: number;
  netQty: number;
  unit: Unit;
  isAvailable: boolean;
  shop?: Shop;
  product?: Product;
}

// -------------------------------------------------------------
// 📦 ORDER MODELS
// -------------------------------------------------------------

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  pricePerUnit: number;
  product?: Product;
}

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
  delivery?: Delivery;
  payment?: Payment;
}

// -------------------------------------------------------------
// 🚚 DELIVERY MODELS
// -------------------------------------------------------------

export interface DeliveryAgent {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  vehicleNumber?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  isAvailable: boolean;
  createdAt: string;
  deliveries?: Delivery[];
}

export interface Delivery {
  id: number;
  orderId: number;
  agentId?: number;
  deliveryStatus: DeliveryStatus;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  order?: Order;
  agent?: DeliveryAgent;
}

// -------------------------------------------------------------
// 💳 PAYMENT MODELS
// -------------------------------------------------------------

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: string;
  transactionId?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  order?: Order;
}

// -------------------------------------------------------------
// 🧠 HELPER TYPES FOR FRONTEND UI
// -------------------------------------------------------------

// 🛒 Used for displaying available products in catalog or search
export interface AvailableProduct {
  id: number;
  name: string;
  brand?: string;
  image: string;
  description: string;
  category?: string;
  netQty: string;
  availableIn: {
    shopId: number;
    shopName: string;
    city: string;
    price: number;
    quantity: number;
    netQty: number;
    unit: Unit;
    deliveryTime: number;
  }[];
}

// 📊 Generic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count?: number;
  data?: T;
}


export interface NearbyShop extends Shop {
  distance: number; // distance in km
  totalProducts: number;
}
