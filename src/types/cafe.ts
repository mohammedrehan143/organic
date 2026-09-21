export type DietaryType = 'veg' | 'non-veg' | 'vegan' | 'egg';

export interface UserLocation {
  formattedAddress: string;
  shortAddress: string;
  road?: string;
  houseNumber?: string;
  building?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  lat: number;
  lng: number;
}

export interface CustomizationOptions {
  milk?: string[];
  temperature?: string[];
  sweetness?: string[];
  portion?: string[];
  flavor?: string[];
  [key: string]: string[] | undefined;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  detailedDescription?: string;
  price: string;
  priceNumber: number;
  image: string;
  calories?: number;
  dietary: DietaryType;
  tasteNotes?: string[];
  featured?: boolean;
  signature?: boolean;
  prepTime?: string;
  customizationOptions?: CustomizationOptions;
  isAvailable: boolean;
  displayOrder?: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: Record<string, string>;
  itemTotal: number;
}

export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export type DeliveryMethod = 'delivery' | 'pickup';

export type DeliveryAgentStatus =
  | 'active'
  | 'inactive'
  | 'on_delivery'
  | 'off_duty';

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  status: DeliveryAgentStatus;
  vehicleType: string;
  ordersDeliveredCount: number;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  address?: string;
  unit?: string;
  defaultInstructions?: string;
  lat?: number;
  lng?: number;
  orderCount: number;
  totalSpent: number;
}

export type SosReason =
  | 'breakdown'
  | 'accident'
  | 'flood'
  | 'traffic'
  | 'medical'
  | 'threat'
  | 'other'
  | string;

export interface SosAlert {
  id: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  orderId?: string;
  tokenId?: string;
  reason: SosReason;
  notes?: string;
  lat?: number;
  lng?: number;
  locationAddress?: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  unitOrApt?: string;
  deliveryInstructions?: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  tokenId: string;
  trackingCode: string;
  customerId?: string;
  deliveryAgentId?: string;
  deliveryOtp: string; // 4-digit verification code
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  estimatedTime: string;
  paymentMethod: string;
  paymentStatus: string;
  riderName?: string;
  riderPhone?: string;
  rating?: number;
  feedbackTags?: string[];
  feedbackNote?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface AdminCredentials {
  pin: string;
  isMaster?: boolean;
}

export type MembershipPlanType = '1_month' | '6_months';
export type MembershipBillingType = 'postpaid' | 'prepaid';
export type MembershipStatus = 'active' | 'expired' | 'cancelled';

export interface Membership {
  id: string;
  phone: string;
  customerName: string;
  customerEmail?: string;
  address?: string;
  planType: MembershipPlanType;
  planName: string;
  billingType: MembershipBillingType;
  price: number;
  status: MembershipStatus;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
}
