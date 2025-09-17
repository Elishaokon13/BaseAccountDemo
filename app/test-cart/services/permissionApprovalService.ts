export interface PermissionRequest {
  id: string;
  subAccountId: string;
  amount: number;
  recipientAddress: string;
  purpose: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvedAt?: number;
  rejectedAt?: number;
  approvedBy?: string;
  rejectionReason?: string;
  expiresAt: number;
}

export interface PermissionApprovalConfig {
  autoApproveThreshold: number;
  maxPendingRequests: number;
  requestExpiryHours: number;
  requireApprovalForSubAccounts: boolean;
  allowedRecipients: string[];
  blockedRecipients: string[];
}

export class PermissionApprovalService {
  private config: PermissionApprovalConfig;
  private requests: PermissionRequest[] = [];

  constructor() {
    this.config = this.loadConfig();
    this.requests = this.loadRequests();
  }

  private loadConfig(): PermissionApprovalConfig {
    if (typeof window === 'undefined') {
      return this.getDefaultConfig();
    }

    const stored = localStorage.getItem('permissionApprovalConfig');
    if (stored) {
      try {
        return { ...this.getDefaultConfig(), ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load permission approval config:', error);
      }
    }

    return this.getDefaultConfig();
  }

  private loadRequests(): PermissionRequest[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const stored = localStorage.getItem('permissionRequests');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load permission requests:', error);
      }
    }

    return [];
  }

  private getDefaultConfig(): PermissionApprovalConfig {
    return {
      autoApproveThreshold: 5, // Auto-approve amounts under $5
      maxPendingRequests: 10,
      requestExpiryHours: 24,
      requireApprovalForSubAccounts: true,
      allowedRecipients: [],
      blockedRecipients: [],
    };
  }

  private saveConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('permissionApprovalConfig', JSON.stringify(this.config));
    }
  }

  private saveRequests(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('permissionRequests', JSON.stringify(this.requests));
    }
  }

  getConfig(): PermissionApprovalConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PermissionApprovalConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getRequests(): PermissionRequest[] {
    return [...this.requests];
  }

  getPendingRequests(): PermissionRequest[] {
    return this.requests.filter(req => req.status === 'pending' && req.expiresAt > Date.now());
  }

  getRequestById(id: string): PermissionRequest | undefined {
    return this.requests.find(req => req.id === id);
  }

  async requestPermission(
    subAccountId: string,
    amount: number,
    recipientAddress: string,
    purpose: string
  ): Promise<{ success: boolean; requestId?: string; autoApproved?: boolean; error?: string }> {
    try {
      // Check if recipient is blocked
      if (this.config.blockedRecipients.includes(recipientAddress.toLowerCase())) {
        return {
          success: false,
          error: 'Recipient address is blocked',
        };
      }

      // Check if recipient is in allowed list (if configured)
      if (this.config.allowedRecipients.length > 0 && 
          !this.config.allowedRecipients.includes(recipientAddress.toLowerCase())) {
        return {
          success: false,
          error: 'Recipient address is not in allowed list',
        };
      }

      // Check pending requests limit
      const pendingCount = this.getPendingRequests().length;
      if (pendingCount >= this.config.maxPendingRequests) {
        return {
          success: false,
          error: 'Too many pending requests. Please wait for some to be processed.',
        };
      }

      // Check if auto-approval applies
      const autoApproved = amount <= this.config.autoApproveThreshold;
      
      const request: PermissionRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        subAccountId,
        amount,
        recipientAddress,
        purpose,
        requestedAt: Date.now(),
        status: autoApproved ? 'approved' : 'pending',
        expiresAt: Date.now() + (this.config.requestExpiryHours * 60 * 60 * 1000),
        ...(autoApproved && {
          approvedAt: Date.now(),
          approvedBy: 'system',
        }),
      };

      this.requests.push(request);
      this.saveRequests();

      console.log(`✅ Permission request ${autoApproved ? 'auto-approved' : 'created'}:`, request);

      return {
        success: true,
        requestId: request.id,
        autoApproved,
      };
    } catch (error: any) {
      console.error('❌ Failed to create permission request:', error);
      return {
        success: false,
        error: error.message || 'Failed to create permission request',
      };
    }
  }

  async approveRequest(requestId: string, approvedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      const request = this.getRequestById(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Request not found',
        };
      }

      if (request.status !== 'pending') {
        return {
          success: false,
          error: 'Request is not pending',
        };
      }

      if (request.expiresAt <= Date.now()) {
        request.status = 'expired';
        this.saveRequests();
        return {
          success: false,
          error: 'Request has expired',
        };
      }

      request.status = 'approved';
      request.approvedAt = Date.now();
      request.approvedBy = approvedBy;

      this.saveRequests();

      console.log('✅ Permission request approved:', request);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to approve request:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve request',
      };
    }
  }

  async rejectRequest(requestId: string, rejectedBy: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const request = this.getRequestById(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Request not found',
        };
      }

      if (request.status !== 'pending') {
        return {
          success: false,
          error: 'Request is not pending',
        };
      }

      request.status = 'rejected';
      request.rejectedAt = Date.now();
      request.approvedBy = rejectedBy;
      request.rejectionReason = reason;

      this.saveRequests();

      console.log('✅ Permission request rejected:', request);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to reject request:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject request',
      };
    }
  }

  async canSpend(subAccountId: string, amount: number, recipientAddress: string): Promise<{
    allowed: boolean;
    reason?: string;
    requiresApproval: boolean;
    pendingRequestId?: string;
  }> {
    // Check if auto-approval applies
    if (amount <= this.config.autoApproveThreshold) {
      return {
        allowed: true,
        requiresApproval: false,
      };
    }

    // Check for existing approved request
    const approvedRequest = this.requests.find(req => 
      req.subAccountId === subAccountId &&
      req.amount === amount &&
      req.recipientAddress.toLowerCase() === recipientAddress.toLowerCase() &&
      req.status === 'approved' &&
      req.expiresAt > Date.now()
    );

    if (approvedRequest) {
      return {
        allowed: true,
        requiresApproval: false,
      };
    }

    // Check for pending request
    const pendingRequest = this.requests.find(req => 
      req.subAccountId === subAccountId &&
      req.amount === amount &&
      req.recipientAddress.toLowerCase() === recipientAddress.toLowerCase() &&
      req.status === 'pending' &&
      req.expiresAt > Date.now()
    );

    if (pendingRequest) {
      return {
        allowed: false,
        reason: 'Request is pending approval',
        requiresApproval: true,
        pendingRequestId: pendingRequest.id,
      };
    }

    // Check if approval is required
    if (this.config.requireApprovalForSubAccounts) {
      return {
        allowed: false,
        reason: 'Approval required for this amount',
        requiresApproval: true,
      };
    }

    return {
      allowed: true,
      requiresApproval: false,
    };
  }

  cleanupExpiredRequests(): void {
    const now = Date.now();
    this.requests = this.requests.map(req => {
      if (req.status === 'pending' && req.expiresAt <= now) {
        return { ...req, status: 'expired' as const };
      }
      return req;
    });
    this.saveRequests();
  }

  getStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
  } {
    const stats = {
      total: this.requests.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    };

    this.requests.forEach(req => {
      stats[req.status]++;
    });

    return stats;
  }
}
