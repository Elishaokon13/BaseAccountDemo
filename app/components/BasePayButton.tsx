'use client';

import React from 'react';

interface BasePayButtonProps {
  colorScheme?: 'light' | 'dark';
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const BasePayButton: React.FC<BasePayButtonProps> = ({
  colorScheme = 'light',
  onClick,
  disabled = false,
  children,
  className = '',
}) => {
  const isLight = colorScheme === 'light';
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      style={{
        backgroundColor: isLight ? '#ffffff' : '#0000FF',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minWidth: '180px',
        height: '44px',
        color: isLight ? '#000000' : '#ffffff',
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          backgroundColor: isLight ? '#0000FF' : '#FFFFFF',
          borderRadius: '2px',
          flexShrink: 0,
        }}
      />
      {children || 'Pay with Base Pay'}
    </button>
  );
};
