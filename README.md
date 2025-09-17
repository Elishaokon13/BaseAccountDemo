# Base Account E-Commerce Tutorial

A complete tutorial demonstrating Base Account features through a mini e-commerce checkout application. This project showcases authentication, spend permissions, and one-tap payments using Base Account SDK.

## 🎯 What You'll Learn

- How to integrate Base Account authentication
- How to implement spend permissions for automated payments
- How to create one-tap USDC checkout experiences
- How to build a complete e-commerce flow with Base Account

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Base Account (sign up at [base.org](https://base.org))
- Basic knowledge of React and Next.js

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd BaseAccountDemo
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Tutorial Steps

### Step 1: Authentication with Base Account

The app starts with a clean authentication screen using the official Base Sign-in UI.

**What happens:**
- User clicks "Sign in with Base" button
- Base Account SDK handles wallet connection
- User signs a message to authenticate
- Authentication state is stored and managed

**Key files:**
- `app/contexts/AuthContext.tsx` - Authentication logic
- `app/contexts/BaseAccountContext.tsx` - Base Account SDK setup
- `app/components/Header.tsx` - Sign-in UI component

### Step 2: Set Spend Permissions

After authentication, users must grant spend permissions for automated payments.

**What happens:**
- User sees spend permission details ($20 USDC daily limit)
- User signs an EIP-712 message to grant permissions
- Permission is stored for future automated payments
- No additional signatures needed for subsequent payments

**Key files:**
- `app/contexts/PaymentContext.tsx` - Spend permission management
- `app/page.tsx` - Permission UI and flow control

### Step 3: One-Tap Purchase

With permissions set, users can make instant payments without additional signatures.

**What happens:**
- User clicks "Buy Now with Base Pay" button
- Payment is processed automatically using spend permissions
- Transaction is confirmed and receipt is shown
- No wallet popups or additional signatures required

**Key files:**
- `app/components/ProductDisplay.tsx` - Product and payment UI
- `app/services/paymentService.ts` - Payment processing logic

## 🏗️ Project Structure

```
app/
├── components/           # React components
│   ├── Header.tsx       # Navigation with Base Sign-in UI
│   ├── ProductDisplay.tsx # Product showcase and payment
│   └── BasePayButton.tsx # Custom Base Pay button
├── contexts/            # React Context providers
│   ├── BaseAccountContext.tsx # Base Account SDK setup
│   ├── AuthContext.tsx  # Authentication state management
│   └── PaymentContext.tsx # Payment and spend permissions
├── services/            # Business logic
│   └── paymentService.ts # Payment processing with Base Pay
├── types/               # TypeScript type definitions
│   └── product.ts       # Product data structure
└── data/                # Static data
    └── products.ts      # Product catalog
```

## 🔧 Key Technologies

- **Next.js 15** - React framework with App Router
- **Base Account SDK** - Authentication and payments
- **Viem** - Ethereum library for blockchain interactions
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework

## 💡 Core Concepts Explained

### Base Account Authentication

Base Account provides a seamless authentication experience:

```typescript
// Authentication flow
const result = await provider.request({
  method: 'wallet_connect',
  params: [{
    version: '1',
    capabilities: {
      signInWithEthereum: { 
        nonce, 
        chainId: '0x2105' // Base Mainnet
      }
    }
  }]
});
```

### Spend Permissions

Spend permissions allow automated payments without user interaction:

```typescript
// Request spend permission
const permission = await requestSpendPermission({
  account: user.address,
  spender: '0x...', // Your app's spender address
  token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
  chainId: 8453, // Base Mainnet
  allowance: 20_000_000n, // $20 USDC (6 decimals)
  periodInDays: 1, // Daily reset
  provider: provider,
});
```

### Base Pay Integration

Base Pay provides one-tap payment experiences:

```typescript
// Process payment using Base Pay
const payment = await pay({
  amount: product.price.toString(),
  to: recipientAddress,
  testnet: false, // Set to true for Base Sepolia testnet
});
```

## 🎨 UI Components

### Base Sign-in UI

The app uses the official Base Sign-in UI component:

```tsx
import { SignInWithBaseButton } from '@base-org/account-ui/react';

<SignInWithBaseButton
  onClick={signIn}
  align="center"
  variant="solid"
  colorScheme="light"
/>
```

### Custom Base Pay Button

A custom button component for payments:

```tsx
<BasePayButton
  onClick={handleDirectPayment}
  disabled={!product.inStock || isProcessing}
  colorScheme="light"
  className="w-full py-4 px-8 text-lg font-semibold"
>
  Buy Now with Base Pay - $25.00 USDC
</BasePayButton>
```

## 🔒 Security Considerations

- **Spend Permissions**: Limited to $20 USDC daily to minimize risk
- **EIP-712 Signing**: Secure message signing for permissions
- **Base Mainnet**: Uses real USDC on Base Mainnet (be careful with real funds)
- **Error Handling**: Comprehensive error handling for failed transactions

## 🚨 Important Notes

- **Real Money**: This demo uses Base Mainnet with real USDC
- **Test First**: Consider using Base Sepolia testnet for testing
- **Spend Limits**: The $20 daily limit is for demo purposes
- **Production**: Add proper error handling and user feedback for production use

## 🛠️ Customization

### Changing Spend Limits

Update the allowance in `app/contexts/PaymentContext.tsx`:

```typescript
const allowanceAmount = 50_000_000n; // $50 USDC instead of $20
```

### Adding More Products

Add products to `app/data/products.ts`:

```typescript
export const products: Product[] = [
  {
    id: '1',
    name: 'Your Product',
    price: 15.99,
    description: 'Product description',
    image: '/path/to/image.png',
    features: ['Feature 1', 'Feature 2'],
    inStock: true
  }
];
```

### Styling Changes

The app uses Tailwind CSS. Modify classes in components to change appearance:

```tsx
// Change button color
className="bg-green-600 hover:bg-green-700" // Green instead of blue
```

## 📚 Further Reading

- [Base Account Documentation](https://docs.base.org/base-account)
- [Base Pay Integration](https://docs.base.org/base-account/accept-payments)
- [Spend Permissions Guide](https://docs.base.org/base-account/improve-ux/spend-permissions)
- [Base Account UI Components](https://docs.base.org/base-account/reference/ui-elements)

## 🤝 Contributing

This is a tutorial project. Feel free to:
- Fork and experiment with different features
- Add more products or payment flows
- Improve the UI/UX
- Add more comprehensive error handling



**Happy Building with Base Account! 🚀**