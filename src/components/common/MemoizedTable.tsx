import React, { memo, useMemo } from 'react';
import { Token } from '@/store/slices/tokenSlice';

interface MemoizedTableRowProps {
  token: Token;
  index: number;
  onTokenClick: (token: Token) => void;
  onQuickBuy: (token: Token, e: React.MouseEvent) => void;
  formatNumber: (value: number, options?: { currency?: boolean; compact?: boolean }) => string;
  formatTimeAgo: (dateString: string) => string;
  children: React.ReactNode;
}

// Memoized table row component to prevent unnecessary re-renders
export const MemoizedTableRow = memo<MemoizedTableRowProps>(
  ({ token, index, onTokenClick, onQuickBuy, children }) => {
    return <>{children}</>;
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if critical props change
    return (
      prevProps.token.id === nextProps.token.id &&
      prevProps.token.price === nextProps.token.price &&
      prevProps.token.priceChange24h === nextProps.token.priceChange24h &&
      prevProps.token.volume24h === nextProps.token.volume24h &&
      prevProps.token.lastUpdate === nextProps.token.lastUpdate &&
      prevProps.index === nextProps.index
    );
  }
);

MemoizedTableRow.displayName = 'MemoizedTableRow';

// Memoized price formatter to avoid recalculations
export const useMemoizedFormatters = () => {
  const formatNumber = useMemo(() => {
    const formatters = new Map();
    
    return (value: number, options?: { currency?: boolean; compact?: boolean }) => {
      const { currency = false, compact = false } = options || {};
      const key = `${currency}-${compact}`;
      
      if (!formatters.has(key)) {
        if (compact && value >= 1000000) {
          formatters.set(key, new Intl.NumberFormat('en-US', {
            style: currency ? 'currency' : 'decimal',
            currency: currency ? 'USD' : undefined,
            notation: 'compact',
            maximumFractionDigits: 1,
          }));
        } else {
          formatters.set(key, new Intl.NumberFormat('en-US', {
            style: currency ? 'currency' : 'decimal',
            currency: currency ? 'USD' : undefined,
            minimumFractionDigits: currency && value < 0.01 ? 6 : 0,
            maximumFractionDigits: currency && value < 0.01 ? 6 : 2,
          }));
        }
      }
      
      return formatters.get(key).format(value);
    };
  }, []);

  const formatTimeAgo = useMemo(() => {
    return (dateString: string) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };
  }, []);

  return { formatNumber, formatTimeAgo };
};

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = (props: P) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Flag renders taking longer than 16ms
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    });

    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  
  return WrappedComponent;
}