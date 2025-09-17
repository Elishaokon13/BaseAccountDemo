'use client';

import { requestSpendPermission, fetchPermissions, getPermissionStatus } from '@base-org/account/spend-permission';

export interface SpendPermission {
  account: string;
  spender: string;
  token: string;
  allowance: bigint;
  period: bigint;
  start: bigint;
  end: bigint;
  salt: bigint;
  extraData: string;
  signature: string;
}

export interface SpendPermissionStatus {
  isActive: boolean;
  remainingSpend: bigint;
  totalAllowance: bigint;
  periodRemaining: bigint;
}

export class SpendPermissionService {
  private provider: any;
  private userAddress: string | null = null;
  private spenderAddress: string = '0x742d35Cc6634C0532925a3b8D0C0E1c4C5f7f8f9'; // Demo spender address
  private usdcTokenAddress: string = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
  private chainId: number = 8453; // Base Mainnet

  constructor(provider: any) {
    this.provider = provider;
  }

  setUserAddress(address: string) {
    this.userAddress = address;
  }

  /**
   * Check if user has an active spend permission
   */
  async hasActivePermission(): Promise<boolean> {
    if (!this.userAddress || !this.provider) {
      return false;
    }

    try {
      const permissions = await fetchPermissions({
        account: this.userAddress,
        chainId: this.chainId,
        spender: this.spenderAddress,
        provider: this.provider,
      });

      if (permissions.length === 0) {
        return false;
      }

      // Check if any permission is active
      for (const permission of permissions) {
        const status = await getPermissionStatus(permission);
        if (status.isActive) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking spend permissions:', error);
      return false;
    }
  }

  /**
   * Request a new spend permission from the user
   */
  async requestPermission(allowance: bigint = 20_000_000n, periodInDays: number = 30): Promise<SpendPermission | null> {
    if (!this.userAddress || !this.provider) {
      throw new Error('User address and provider required');
    }

    try {
      console.log('Requesting spend permission...', {
        account: this.userAddress,
        spender: this.spenderAddress,
        token: this.usdcTokenAddress,
        allowance: allowance.toString(),
        periodInDays,
      });

      const permission = await requestSpendPermission({
        account: this.userAddress,
        spender: this.spenderAddress,
        token: this.usdcTokenAddress,
        chainId: this.chainId,
        allowance: allowance, // 20 USDC (6 decimals)
        periodInDays: periodInDays,
        provider: this.provider,
      });

      console.log('Spend permission granted:', permission);
      return permission;
    } catch (error) {
      console.error('Failed to request spend permission:', error);
      throw error;
    }
  }

  /**
   * Check if user can spend a specific amount
   */
  async canSpend(amount: number): Promise<{ allowed: boolean; reason?: string; remainingSpend?: bigint }> {
    if (!this.userAddress || !this.provider) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    try {
      const permissions = await fetchPermissions({
        account: this.userAddress,
        chainId: this.chainId,
        spender: this.spenderAddress,
        provider: this.provider,
      });

      if (permissions.length === 0) {
        return { allowed: false, reason: 'No spend permission found' };
      }

      // Check the most recent permission
      const latestPermission = permissions[0];
      const status = await getPermissionStatus(latestPermission);

      if (!status.isActive) {
        return { allowed: false, reason: 'Spend permission is not active' };
      }

      const amountWei = BigInt(Math.floor(amount * 1_000_000)); // Convert to USDC wei (6 decimals)

      if (amountWei > status.remainingSpend) {
        return { 
          allowed: false, 
          reason: `Insufficient spend allowance. Remaining: ${(Number(status.remainingSpend) / 1_000_000).toFixed(2)} USDC`,
          remainingSpend: status.remainingSpend
        };
      }

      return { 
        allowed: true, 
        remainingSpend: status.remainingSpend 
      };
    } catch (error) {
      console.error('Error checking spend permission:', error);
      return { allowed: false, reason: 'Error checking spend permission' };
    }
  }

  /**
   * Get spend permission status
   */
  async getPermissionStatus(): Promise<SpendPermissionStatus | null> {
    if (!this.userAddress || !this.provider) {
      return null;
    }

    try {
      const permissions = await fetchPermissions({
        account: this.userAddress,
        chainId: this.chainId,
        spender: this.spenderAddress,
        provider: this.provider,
      });

      if (permissions.length === 0) {
        return null;
      }

      const latestPermission = permissions[0];
      const status = await getPermissionStatus(latestPermission);

      return {
        isActive: status.isActive,
        remainingSpend: status.remainingSpend,
        totalAllowance: latestPermission.allowance,
        periodRemaining: status.periodRemaining,
      };
    } catch (error) {
      console.error('Error getting permission status:', error);
      return null;
    }
  }
}
