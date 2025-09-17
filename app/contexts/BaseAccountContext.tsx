'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createWalletClient, custom, type WalletClient } from 'viem';
import { base } from 'viem/chains';

interface BaseAccountContextType {
  sdk: unknown | null;
  provider: unknown | null;
  walletClient: WalletClient | null;
  isInitialized: boolean;
  error: string | null;
}

const BaseAccountContext = createContext<BaseAccountContextType | undefined>(undefined);

interface BaseAccountProviderProps {
  children: ReactNode;
}

export function BaseAccountProvider({ children }: BaseAccountProviderProps) {
  const [sdk, setSdk] = useState<unknown | null>(null);
  const [provider, setProvider] = useState<unknown | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeBaseAccount = async () => {
      try {
        setError(null);
        
        // Only initialize on client side
        if (typeof window === 'undefined') {
          console.log('Skipping Base Account initialization on server side');
          return;
        }
        
        console.log('Initializing Base Account SDK on client side...');
        
        // Dynamically import Base Account SDK on client side
        const { createBaseAccountSDK } = await import('@base-org/account');
        
        // Initialize Base Account SDK
        const baseAccountSDK = createBaseAccountSDK({
          appName: 'Mini e-Commerce Checkout',
          appLogoUrl: '/next.svg', // Using Next.js logo as placeholder
          appChainIds: [base.id], // Base Mainnet
          // Note: Paymaster URL needs to be obtained from Coinbase Developer Portal
          // For demo purposes, we'll handle this in the payment service
        });

        // Get the provider
        const ethereumProvider = baseAccountSDK.getProvider();
        
        // Create Viem wallet client
        const client = createWalletClient({
          chain: base,
          transport: custom(ethereumProvider)
        });

        setSdk(baseAccountSDK);
        setProvider(ethereumProvider);
        setWalletClient(client);
        setIsInitialized(true);
        
        console.log('✅ Base Account SDK initialized successfully');
        console.log('Provider:', ethereumProvider);
        console.log('Wallet Client:', client);
        console.log('SDK methods available:', Object.keys(baseAccountSDK));
        console.log('Provider methods available:', Object.keys(ethereumProvider));
        console.log('Provider has request method:', typeof ethereumProvider.request === 'function');
        
        // Test capability detection
        try {
          const capabilities = await ethereumProvider.request({
            method: 'wallet_getCapabilities',
            params: ['0x0000000000000000000000000000000000000000'] // Dummy address for testing
          });
          console.log('Capabilities test result:', capabilities);
        } catch (capError) {
          console.log('Capabilities test failed (expected):', capError);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Base Account SDK';
        setError(errorMessage);
        console.error('Base Account initialization error:', err);
      }
    };

    initializeBaseAccount();
  }, []);

  const value: BaseAccountContextType = {
    sdk,
    provider,
    walletClient,
    isInitialized,
    error
  };

  return (
    <BaseAccountContext.Provider value={value}>
      {children}
    </BaseAccountContext.Provider>
  );
}

export function useBaseAccount() {
  const context = useContext(BaseAccountContext);
  if (context === undefined) {
    throw new Error('useBaseAccount must be used within a BaseAccountProvider');
  }
  return context;
}
