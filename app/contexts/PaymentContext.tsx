/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * Payment Context
 * 
 * Manages payment processing and spend permissions for the Base Account integration.
 * This context handles:
 * - Spend permission requests and status checking
 * - Payment processing using Base Pay
 * - USDC balance queries
 * - Payment state management
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useBaseAccount } from './BaseAccountContext';
import { useAuth } from './AuthContext';
import { PaymentService, PaymentRequest, PaymentResult } from '../services/paymentService';

interface PaymentContextType {
  isProcessing: boolean;
  lastPaymentResult: PaymentResult | null;
  processPayment: (amount: number, recipientAddress: string) => Promise<PaymentResult>;
  clearPaymentResult: () => void;
  getUSDCBalance: (address: string) => Promise<string>;
  isPaymentReady: boolean;
  hasSpendPermission: boolean;
  requestSpendPermission: () => Promise<boolean>;
  isRequestingPermission: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const { sdk, provider, walletClient, isInitialized } = useBaseAccount();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPaymentResult, setLastPaymentResult] = useState<PaymentResult | null>(null);
  const [hasSpendPermission, setHasSpendPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const paymentService = React.useMemo(() => {
    if (sdk && provider && walletClient) {
      return new PaymentService(sdk, provider, walletClient);
    }
    return null;
  }, [sdk, provider, walletClient]);

  const requestSpendPermission = async (): Promise<boolean> => {
    if (!sdk || !provider || !user) {
      console.error('SDK, provider, or user not available for spend permission request');
      return false;
    }

    setIsRequestingPermission(true);

    try {
      console.log('Requesting spend permission...');
      
      // Import the spend permission utilities
      const { requestSpendPermission } = await import('@base-org/account/spend-permission');
      
      // Request spend permission for $20 USDC daily limit
      const permission = await requestSpendPermission({
        account: user.address,
        spender: '0x742d35Cc6634C0532925a3b8D0C0E1c4C5f7f8f9', // Your app's spender address
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base Mainnet
        chainId: 8453, // Base Mainnet
        allowance: BigInt(20_000_000), // $20 USDC (6 decimals)
        periodInDays: 1, // Daily reset
        provider: provider as any, // Type assertion for provider compatibility
      });

      console.log('✅ Spend permission granted:', permission);
      setHasSpendPermission(true);
      return true;
    } catch (error: unknown) {
      console.error('❌ Failed to request spend permission:', error);
      return false;
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const processPayment = async (amount: number, recipientAddress: string): Promise<PaymentResult> => {
    if (!paymentService) {
      return {
        success: false,
        error: 'Payment service not initialized',
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    if (!hasSpendPermission) {
      return {
        success: false,
        error: 'Spend permission not granted. Please set spend permissions first.',
      };
    }

    setIsProcessing(true);
    setLastPaymentResult(null);

    try {
      const paymentRequest: PaymentRequest = {
        amount,
        recipientAddress,
        userAddress: user.address,
      };

      const result = await paymentService.processPayment(paymentRequest);
      setLastPaymentResult(result);
      return result;
    } catch (error: unknown) {
      const errorResult: PaymentResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
      setLastPaymentResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearPaymentResult = () => {
    setLastPaymentResult(null);
  };

  const getUSDCBalance = async (address: string): Promise<string> => {
    if (!paymentService || !user || !isInitialized) {
      console.log('Payment service not ready or user not authenticated, returning 0.00');
      return '0.00';
    }

    try {
      const balance = await paymentService.getUSDCBalance(address);
      const divisor = BigInt(10 ** 6); // USDC has 6 decimals
      const wholePart = balance / divisor;
      const fractionalPart = balance % divisor;
      
      if (fractionalPart === BigInt(0)) {
        return wholePart.toString();
      }
      
      const fractionalStr = fractionalPart.toString().padStart(6, '0');
      return `${wholePart}.${fractionalStr}`;
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
      return '0.00';
    }
  };

  const isPaymentReady = !!(paymentService && paymentService.isReady() && user && isInitialized);

  const value: PaymentContextType = {
    isProcessing,
    lastPaymentResult,
    processPayment,
    clearPaymentResult,
    getUSDCBalance,
    isPaymentReady,
    hasSpendPermission,
    requestSpendPermission,
    isRequestingPermission,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}