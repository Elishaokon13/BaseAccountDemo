export interface SpendLimitConfig {
  dailyLimit: number;
  monthlyLimit: number;
  requiresApproval: boolean;
  approvalThreshold: number;
  autoResetDaily: boolean;
  autoResetMonthly: boolean;
}

export interface SpendTracking {
  daily: {
    amount: number;
    limit: number;
    resetDate: string;
  };
  monthly: {
    amount: number;
    limit: number;
    resetDate: string;
  };
  totalTransactions: number;
  lastTransaction?: {
    amount: number;
    timestamp: number;
    subAccountId?: string;
  };
}

export class SpendLimitService {
  private config: SpendLimitConfig;
  private tracking: SpendTracking;

  constructor() {
    this.config = this.loadConfig();
    this.tracking = this.loadTracking();
  }

  private loadConfig(): SpendLimitConfig {
    if (typeof window === 'undefined') {
      return this.getDefaultConfig();
    }

    const stored = localStorage.getItem('spendLimitConfig');
    if (stored) {
      try {
        return { ...this.getDefaultConfig(), ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load spend limit config:', error);
      }
    }

    return this.getDefaultConfig();
  }

  private loadTracking(): SpendTracking {
    if (typeof window === 'undefined') {
      return this.getDefaultTracking();
    }

    const stored = localStorage.getItem('spendTracking');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return this.validateTracking(parsed);
      } catch (error) {
        console.error('Failed to load spend tracking:', error);
      }
    }

    return this.getDefaultTracking();
  }

  private getDefaultConfig(): SpendLimitConfig {
    return {
      dailyLimit: 20,
      monthlyLimit: 500,
      requiresApproval: true,
      approvalThreshold: 10,
      autoResetDaily: true,
      autoResetMonthly: true,
    };
  }

  private getDefaultTracking(): SpendTracking {
    const today = new Date().toDateString();
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString();

    return {
      daily: {
        amount: 0,
        limit: this.config.dailyLimit,
        resetDate: today,
      },
      monthly: {
        amount: 0,
        limit: this.config.monthlyLimit,
        resetDate: firstDayOfMonth,
      },
      totalTransactions: 0,
    };
  }

  private validateTracking(tracking: any): SpendTracking {
    const today = new Date().toDateString();
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString();

    // Reset daily tracking if it's a new day
    if (tracking.daily?.resetDate !== today) {
      tracking.daily = {
        amount: 0,
        limit: this.config.dailyLimit,
        resetDate: today,
      };
    }

    // Reset monthly tracking if it's a new month
    if (tracking.monthly?.resetDate !== firstDayOfMonth) {
      tracking.monthly = {
        amount: 0,
        limit: this.config.monthlyLimit,
        resetDate: firstDayOfMonth,
      };
    }

    return {
      daily: tracking.daily || this.getDefaultTracking().daily,
      monthly: tracking.monthly || this.getDefaultTracking().monthly,
      totalTransactions: tracking.totalTransactions || 0,
      lastTransaction: tracking.lastTransaction,
    };
  }

  private saveConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spendLimitConfig', JSON.stringify(this.config));
    }
  }

  private saveTracking(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spendTracking', JSON.stringify(this.tracking));
    }
  }

  getConfig(): SpendLimitConfig {
    return { ...this.config };
  }

  getTracking(): SpendTracking {
    return { ...this.tracking };
  }

  updateConfig(newConfig: Partial<SpendLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  canSpend(amount: number): {
    allowed: boolean;
    reason?: string;
    dailyRemaining: number;
    monthlyRemaining: number;
  } {
    const dailyRemaining = this.tracking.daily.limit - this.tracking.daily.amount;
    const monthlyRemaining = this.tracking.monthly.limit - this.tracking.monthly.amount;

    if (amount > dailyRemaining) {
      return {
        allowed: false,
        reason: `Amount exceeds daily limit. Remaining: $${dailyRemaining.toFixed(2)}`,
        dailyRemaining,
        monthlyRemaining,
      };
    }

    if (amount > monthlyRemaining) {
      return {
        allowed: false,
        reason: `Amount exceeds monthly limit. Remaining: $${monthlyRemaining.toFixed(2)}`,
        dailyRemaining,
        monthlyRemaining,
      };
    }

    if (this.config.requiresApproval && amount > this.config.approvalThreshold) {
      return {
        allowed: false,
        reason: `Amount requires approval (threshold: $${this.config.approvalThreshold})`,
        dailyRemaining,
        monthlyRemaining,
      };
    }

    return {
      allowed: true,
      dailyRemaining,
      monthlyRemaining,
    };
  }

  recordSpend(amount: number, subAccountId?: string): void {
    this.tracking.daily.amount += amount;
    this.tracking.monthly.amount += amount;
    this.tracking.totalTransactions += 1;
    this.tracking.lastTransaction = {
      amount,
      timestamp: Date.now(),
      subAccountId,
    };

    this.saveTracking();
  }

  resetDaily(): void {
    this.tracking.daily.amount = 0;
    this.tracking.daily.resetDate = new Date().toDateString();
    this.saveTracking();
  }

  resetMonthly(): void {
    this.tracking.monthly.amount = 0;
    this.tracking.monthly.resetDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString();
    this.saveTracking();
  }

  getSpendStatus(): {
    daily: {
      spent: number;
      limit: number;
      percentage: number;
      remaining: number;
    };
    monthly: {
      spent: number;
      limit: number;
      percentage: number;
      remaining: number;
    };
    totalTransactions: number;
  } {
    const dailySpent = this.tracking.daily.amount;
    const dailyLimit = this.tracking.daily.limit;
    const monthlySpent = this.tracking.monthly.amount;
    const monthlyLimit = this.tracking.monthly.limit;

    return {
      daily: {
        spent: dailySpent,
        limit: dailyLimit,
        percentage: (dailySpent / dailyLimit) * 100,
        remaining: dailyLimit - dailySpent,
      },
      monthly: {
        spent: monthlySpent,
        limit: monthlyLimit,
        percentage: (monthlySpent / monthlyLimit) * 100,
        remaining: monthlyLimit - monthlySpent,
      },
      totalTransactions: this.tracking.totalTransactions,
    };
  }
}
