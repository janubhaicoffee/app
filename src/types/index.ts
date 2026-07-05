// Core type definitions for the application

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
  category?: string;
  status?: 'published' | 'draft' | 'archived';
  weight?: number;
  compare_at_price?: number;
  sku?: string;
  barcode?: string;
  tags?: string[];
  variants?: ProductVariant[];
  gallery_images?: string[];
  nutrition?: NutritionInfo;
  arabica_pct?: number;
  chicory_pct?: number;
  robusta_pct?: number;
  scientific_details?: string;
  seo_title?: string;
  seo_description?: string;
  subscription_discount_weekly?: number;
  subscription_discount_monthly?: number;
  featured?: boolean;
  sort_order?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  name?: string;
  price: number;
  weight: number;
  roast?: string;
  stock: number;
  cogs?: number;
  image_url?: string;
  nutrition?: NutritionInfo;
  arabica_pct?: number;
  chicory_pct?: number;
  robusta_pct?: number;
  scientific_details?: string;
}

export interface NutritionInfo {
  energy?: number;
  protein?: number | string;
  fat?: number | string;
  carbs?: number | string;
  sugar?: number | string;
  caffeine?: number | string;
}

export interface CartItem {
  id: string;
  variant_id?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  subscription?: string;
  isGift?: boolean;
  confirmed?: boolean;
}

export interface CartContextType {
  cartItems: CartItem[];
  interceptorItem: CartItem | null;
  setInterceptorItem: (item: CartItem | null) => void;
  confirmInterceptor: () => void;
  addToCart: (product: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  awb_number?: string;
  is_gift?: boolean;
  gift_message?: string;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface ShippingRate {
  shipping_cost: number;
  courier_name: string;
  estimated_delivery_days: string;
  courier_id?: string | number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  giftMessage?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ProgressionData {
  profile: {
    total_points: number;
  };
  ledger: Array<{
    id: string;
    action_type: string;
    points_awarded: number;
    created_at: string;
  }>;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: unknown | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ApiResponse>;
  signUp: (email: string, password: string) => Promise<ApiResponse>;
  signOut: () => Promise<void>;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_subscription_id?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
    deferredPrompt: Event & { prompt: () => Promise<void> };
  }
}
