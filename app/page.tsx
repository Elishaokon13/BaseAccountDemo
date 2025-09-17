'use client';

/**
 * Main E-Commerce Tutorial Page
 * 
 * This page demonstrates a complete Base Account integration with:
 * 1. Authentication using Base Sign-in UI
 * 2. Spend permissions setup for automated payments
 * 3. One-tap purchase using Base Pay
 * 
 * The flow is designed to be tutorial-friendly with clear step indicators
 * and educational content for each stage.
 */

import { Header } from "./components/Header";
import { useAuth } from "./contexts/AuthContext";
import { usePayment } from "./contexts/PaymentContext";
import { ProductDisplay } from "./components/ProductDisplay";
import { getFeaturedProduct } from "./data/products";
import { useState, useEffect } from "react";
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export default function Home() {
  // Authentication state from AuthContext
  const { isAuthenticated, signIn } = useAuth();
  
  // Payment and spend permission state from PaymentContext
  const { isPaymentReady, hasSpendPermission, requestSpendPermission, isRequestingPermission } = usePayment();
  
  // Current step in the tutorial flow (1: Auth, 2: Permissions, 3: Purchase)
  const [currentStep, setCurrentStep] = useState(1);

  // Get the featured product for the demo
  const product = getFeaturedProduct();

  /**
   * Determine the current step based on authentication and permission state
   * This creates a smooth tutorial flow that guides users through each step
   */
  useEffect(() => {
    if (isAuthenticated && isPaymentReady) {
      if (hasSpendPermission) {
        setCurrentStep(3); // Ready to purchase - all setup complete
      } else {
        setCurrentStep(2); // Need to set spend permissions
      }
    } else if (isAuthenticated) {
      setCurrentStep(2); // Authenticated but payment not ready
    } else {
      setCurrentStep(1); // Need to authenticate first
    }
  }, [isAuthenticated, isPaymentReady, hasSpendPermission]);

  /**
   * Handle spend permission setup
   * This is a critical step that allows automated payments without additional signatures
   */
  const handleSetSpendPermissions = async () => {
    const success = await requestSpendPermission();
    if (success) {
      setCurrentStep(3); // Move to purchase step
    } else {
      alert('Failed to set spend permissions. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Flow Progress */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-8">
                {/* Step 1: Auth */}
                <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Auth with Base Account</span>
                </div>

                <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>

                {/* Step 2: Spend Permissions */}
                <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Set Spend Permissions</span>
                </div>

                <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>

                {/* Step 3: Purchase */}
                <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Purchase with Base Pay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Base Commerce</h1>
              <p className="text-xl text-gray-600 mb-8">Sign in with your Base Account to get started</p>
              <SignInWithBaseButton
                onClick={signIn}
                align="center"
                variant="solid"
                colorScheme="light"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Set Spend Permissions</h1>
              <p className="text-xl text-gray-600 mb-8">Authorize Base Commerce to spend USDC on your behalf</p>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend Permission Details</h3>
                <div className="space-y-4 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <span className="font-mono text-sm">USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Allowance:</span>
                    <span className="font-semibold text-blue-600">$20.00 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span className="text-gray-900">Daily reset</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="text-gray-900">Base Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spender:</span>
                    <span className="font-mono text-xs text-gray-500">Base Commerce</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This allows Base Commerce to automatically process payments up to $20 USDC without requiring additional signatures.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSetSpendPermissions}
                disabled={isRequestingPermission}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isRequestingPermission ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Requesting Permission...
                  </>
                ) : (
                  'Set Spend Permissions'
                )}
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Ready to Purchase!</h1>
                <p className="text-xl text-gray-600">You&apos;re all set to make secure payments with Base Pay</p>
              </div>
              
              <ProductDisplay 
                product={product}
                onAddToCart={() => {}}
                onPurchase={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}