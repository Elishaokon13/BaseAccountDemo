export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Price in USDC
  image: string;
  category: string;
  inStock: boolean;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
