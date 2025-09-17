'use client';

/**
 * Product Display Component
 * 
 * Shows product details and handles direct payment using Base Pay.
 * This component demonstrates one-tap payments using spend permissions.
 * No additional wallet interactions are required after spend permissions are set.
 */

import { useState } from 'react';
import { Product } from '../types/product';
import { BasePayButton } from './BasePayButton';
import { usePayment } from '../contexts/PaymentContext';

interface ProductDisplayProps {
  product: Product;
  onAddToCart?: (product: Product) => void; // Kept for compatibility, not used in simplified flow
  onPurchase?: (product: Product) => void;
}

export function ProductDisplay({ product, onAddToCart, onPurchase }: ProductDisplayProps) {
  // Local processing state for UI feedback
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment context for processing transactions
  const { processPayment, isProcessing: paymentProcessing } = usePayment();

  /**
   * Handle direct payment using Base Pay and spend permissions
   * 
   * This function demonstrates the power of spend permissions:
   * - No additional wallet signatures required
   * - Payment is processed automatically using pre-approved permissions
   * - User gets immediate feedback on success/failure
   */
  const handleDirectPayment = async () => {
    // Prevent multiple simultaneous payments
    if (paymentProcessing || isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Demo recipient address - in production, this would be your merchant wallet
      const recipientAddress = '0x742d35Cc6634C0532925a3b8D0C0E1c4C5f7f8f9';
      
      console.log('🚀 Processing payment for product:', product.name);
      console.log('💰 Amount:', product.price, 'USDC');
      
      // Process payment using Base Pay (leverages spend permissions)
      const result = await processPayment(product.price, recipientAddress);
      
      if (result.success) {
        console.log('✅ Payment successful!', result);
        alert(`Payment successful! Transaction: ${result.transactionHash}`);
        
        // Notify parent component of successful purchase
        if (onPurchase) {
          onPurchase(product);
        }
      } else {
        console.error('❌ Payment failed:', result.error);
        alert(`Payment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert(`Payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center p-12">
          <div className="w-48 h-48 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-xl text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3">
            <span className="text-5xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xl text-gray-500">USDC</span>
          </div>

          {/* Features - Simplified */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <BasePayButton
              onClick={handleDirectPayment}
              disabled={!product.inStock || isProcessing || paymentProcessing}
              colorScheme="light"
              className="w-full py-4 px-8 text-lg font-semibold"
            >
              {isProcessing || paymentProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </>
              ) : (
                `Buy Now with Base Pay - $${product.price.toFixed(2)} USDC`
              )}
            </BasePayButton>
          </div>

          {/* Base Account Notice - Simplified */}
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            One-tap USDC payment using spend permissions - no additional signatures needed
          </div>
        </div>
      </div>
    </div>
  );
}
