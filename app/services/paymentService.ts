'use client';

/**
 * Payment Service
 * 
 * Handles payment processing using Base Pay and Base Account SDK.
 * This service provides:
 * - USDC payment processing with Base Pay
 * - Payment status monitoring
 * - USDC balance queries
 * - Error handling and logging
 */

import { pay, getPaymentStatus } from '@base-org/account';

// USDC contract address on Base Mainnet
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// USDC has 6 decimals
const USDC_DECIMALS = 6;

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface PaymentRequest {
  amount: number; // Amount in USDC (e.g., 0.1)
  recipientAddress: string;
  userAddress: string;
}

export class PaymentService {
  private sdk: any;
  private provider: any;
  private walletClient: any;

  constructor(sdk: any, provider: any, walletClient: any) {
    this.sdk = sdk;
    this.provider = provider;
    this.walletClient = walletClient;
  }

  /**
   * Process a USDC payment using Base Pay
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      console.log('🚀 Starting Base Pay payment process...');
      console.log('Payment request:', paymentRequest);

      // Use Base Pay for one-tap USDC payments
      const payment = await pay({
        amount: paymentRequest.amount.toString(),
        to: paymentRequest.recipientAddress,
        testnet: false, // Set to true for Base Sepolia testnet
      });

      console.log('✅ Base Pay payment initiated:', payment);

      // Poll for payment status
      const checkStatus = async (): Promise<PaymentResult> => {
        try {
          const status = await getPaymentStatus({
            id: payment.id,
            testnet: false, // Must match the testnet setting used in pay()
          });

          console.log('Payment status:', status);

          if (status.status === 'completed') {
            return {
              success: true,
              transactionHash: payment.id,
            };
          } else if (status.status === 'failed') {
            return {
              success: false,
              error: 'Payment failed or was cancelled',
            };
          } else {
            // Still pending, check again in 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
            return checkStatus();
          }
        } catch (error: any) {
          console.error('Error checking payment status:', error);
          return {
            success: false,
            error: error.message || 'Failed to check payment status',
          };
        }
      };

      return await checkStatus();
    } catch (error: any) {
      console.error('❌ Base Pay payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  }

  /**
   * Get USDC balance for an address
   */
  async getUSDCBalance(address: string): Promise<bigint> {
    try {
      if (!this.provider) {
        console.log('Provider not available for balance check');
        return 0n;
      }

      // Ensure accounts are requested first (required by some wallets like Coinbase)
      try {
        await this.provider.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.log('eth_requestAccounts failed, trying eth_accounts:', error);
        // If eth_requestAccounts fails, try eth_accounts
        await this.provider.request({ method: 'eth_accounts' });
      }

      // USDC balanceOf function selector
      const balanceOfSelector = '0x70a08231';
      const paddedAddress = address.slice(2).padStart(64, '0');

      console.log('Getting USDC balance for address:', address);

      const result = await this.provider.request({
        method: 'eth_call',
        params: [
          {
            to: USDC_CONTRACT_ADDRESS,
            data: balanceOfSelector + paddedAddress,
          },
          'latest'
        ]
      });

      console.log('USDC balance result:', result);
      return BigInt(result);
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
      return 0n;
    }
  }

  /**
   * Check if Base Account is ready for payments
   */
  isReady(): boolean {
    return !!(this.sdk && this.provider && this.walletClient);
  }

  /**
   * Get USDC contract address
   */
  getUSDCContractAddress(): string {
    return USDC_CONTRACT_ADDRESS;
  }
}