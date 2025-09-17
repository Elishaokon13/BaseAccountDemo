import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Base Account Pro',
    description: 'Premium Base Account with advanced features including sub-accounts, spend permissions, and gasless transactions.',
    price: 0.1, // $0.1 USDC
    image: '/next.svg', // Using Next.js logo as placeholder
    category: 'Software',
    inStock: true,
    features: [
      'Unlimited sub-accounts',
      'Advanced spend permissions',
      'Gasless transactions',
      'Priority support',
      'Analytics dashboard'
    ]
  },
  {
    id: '2',
    name: 'Base Account Starter',
    description: 'Essential Base Account features for getting started with Web3 payments and authentication.',
    price: 0.1, // $0.1 USDC
    image: '/next.svg',
    category: 'Software',
    inStock: true,
    features: [
      'Basic authentication',
      'USDC payments',
      'Transaction history',
      'Email support'
    ]
  }
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getFeaturedProduct = (): Product => {
  return mockProducts[0]; // Return the first product as featured
};
