'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useBaseAccount } from './BaseAccountContext';

interface User {
  address: string;
  message: string;
  signature: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { provider, isInitialized } = useBaseAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    if (isInitialized && provider) {
      checkExistingAuth();
    }
  }, [isInitialized, provider]);

  const checkExistingAuth = async () => {
    try {
      const storedAuth = localStorage.getItem('base-account-auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setUser(authData);
        console.log('Restored authentication from localStorage:', authData);
      }
    } catch (err) {
      console.error('Error checking existing auth:', err);
      localStorage.removeItem('base-account-auth');
    }
  };

  const signIn = async () => {
    if (!provider) {
      setError('Base Account provider not available');
      console.error('❌ Authentication failed: Provider not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting authentication flow...');
      console.log('Provider available:', !!provider);
      console.log('Provider type:', typeof provider);
      
      // Generate a nonce for security
      const nonce = window.crypto.randomUUID().replace(/-/g, '');
      console.log('Generated nonce:', nonce);

      // Request authentication using wallet_connect with signInWithEthereum capability
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

      console.log('Authentication result:', result);

      if (result && result.accounts && result.accounts.length > 0) {
        const account = result.accounts[0];
        const { address } = account;
        const { message, signature } = account.capabilities.signInWithEthereum;

        const userData: User = {
          address,
          message,
          signature
        };

        setUser(userData);
        
        // Store authentication data in localStorage
        localStorage.setItem('base-account-auth', JSON.stringify(userData));
        
        console.log('Authentication successful:', userData);
      } else {
        throw new Error('No accounts returned from authentication');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('base-account-auth');
    console.log('User signed out');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
