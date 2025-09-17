import { SubAccount } from '../../contexts/SubAccountContext';

export interface AutoSpendConfig {
  enabled: boolean;
  subAccountId: string;
  maxAmount: number;
  requiresApproval: boolean;
  approvalThreshold: number;
}

export interface AutoSpendResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  usedSubAccount?: SubAccount;
}

export class AutoSpendService {
  private config: AutoSpendConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('autoSpendConfig');
      if (stored) {
        try {
          this.config = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to load auto-spend config:', error);
        }
      }
    }
  }

  private saveConfig(): void {
    if (typeof window !== 'undefined' && this.config) {
      localStorage.setItem('autoSpendConfig', JSON.stringify(this.config));
    }
  }

  setConfig(config: AutoSpendConfig): void {
    this.config = config;
    this.saveConfig();
  }

  getConfig(): AutoSpendConfig | null {
    return this.config;
  }

  isEnabled(): boolean {
    return this.config?.enabled || false;
  }

  canAutoSpend(amount: number, subAccount: SubAccount): boolean {
    if (!this.config?.enabled || !subAccount.isActive) {
      return false;
    }

    // Check if amount is within sub-account limits
    const remainingToday = subAccount.dailySpendLimit - subAccount.totalSpentToday;
    if (remainingToday < amount) {
      return false;
    }

    // Check if amount requires approval
    if (this.config.requiresApproval && amount > this.config.approvalThreshold) {
      return false;
    }

    // Check if amount is within max auto-spend limit
    if (amount > this.config.maxAmount) {
      return false;
    }

    return true;
  }

  async processAutoSpend(
    amount: number,
    recipientAddress: string,
    subAccount: SubAccount,
    paymentService: any
  ): Promise<AutoSpendResult> {
    try {
      console.log('🔄 Processing auto-spend from sub-account:', {
        subAccount: subAccount.name,
        amount,
        recipientAddress,
      });

      if (!this.canAutoSpend(amount, subAccount)) {
        return {
          success: false,
          error: 'Auto-spend not available for this transaction',
        };
      }

      // Use Base Account SDK to send transaction from sub-account
      const provider = paymentService.provider;
      if (!provider) {
        return {
          success: false,
          error: 'Provider not available for auto-spend',
        };
      }

      // Get accounts to ensure sub-account is available
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const subAccountAddress = subAccount.address;

      // Create USDC transfer call data (simplified for demo)
      const transferCall = {
        to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC contract
        data: '0xa9059cbb' + // transfer function selector
              recipientAddress.slice(2).padStart(64, '0') + // to address
              Math.floor(amount * 1000000).toString(16).padStart(64, '0'), // amount in USDC (6 decimals)
        value: '0x0', // No ETH value for token transfer
      };

      // Send transaction from sub-account using wallet_sendCalls
      const result = await provider.request({
        method: 'wallet_sendCalls',
        params: [{
          version: '2.0',
          atomicRequired: true,
          from: subAccountAddress,
          calls: [transferCall],
          capabilities: {
            // Note: Paymaster capabilities removed for demo
          },
        }]
      });

      console.log('✅ Auto-spend successful:', {
        subAccount: subAccount.name,
        amount,
        transactionHash: result,
      });

      return {
        success: true,
        transactionHash: result,
        usedSubAccount: subAccount,
      };
    } catch (error: any) {
      console.error('❌ Auto-spend failed:', error);
      return {
        success: false,
        error: error.message || 'Auto-spend processing failed',
      };
    }
  }

  getAutoSpendStatus(subAccount: SubAccount): {
    canAutoSpend: boolean;
    remainingToday: number;
    maxAutoSpend: number;
    requiresApproval: boolean;
  } {
    const remainingToday = subAccount.dailySpendLimit - subAccount.totalSpentToday;
    const maxAutoSpend = this.config?.maxAmount || 0;
    const requiresApproval = this.config?.requiresApproval || false;

    return {
      canAutoSpend: this.canAutoSpend(1, subAccount), // Check with minimum amount
      remainingToday,
      maxAutoSpend,
      requiresApproval,
    };
  }

  resetConfig(): void {
    this.config = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autoSpendConfig');
    }
  }
}
