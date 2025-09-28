import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Users,
  Zap,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function MarketOverview() {
  // Mock market data - in real app this would come from Redux store
  const marketData = {
    totalVolume: 45678900,
    totalMarketCap: 1234567890,
    activeTokens: 1847,
    newTokens24h: 156,
    avgChange24h: 12.45,
    topGainer: { symbol: 'MOON', change: 245.67 },
    topLoser: { symbol: 'BEAR', change: -18.34 },
    migrationsPending: 23,
  };

  const formatNumber = (value: number, options?: { currency?: boolean; compact?: boolean }) => {
    const { currency = false, compact = false } = options || {};
    
    if (compact && value >= 1000000000) {
      return `${currency ? '$' : ''}${(value / 1000000000).toFixed(1)}B`;
    }
    if (compact && value >= 1000000) {
      return `${currency ? '$' : ''}${(value / 1000000).toFixed(1)}M`;
    }
    if (compact && value >= 1000) {
      return `${currency ? '$' : ''}${(value / 1000).toFixed(1)}K`;
    }
    
    if (currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-US').format(value);
  };

  const overviewCards = [
    {
      title: 'Total Volume (24h)',
      value: formatNumber(marketData.totalVolume, { currency: true, compact: true }),
      change: marketData.avgChange24h,
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Market Cap',
      value: formatNumber(marketData.totalMarketCap, { currency: true, compact: true }),
      change: 8.92,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Active Tokens',
      value: formatNumber(marketData.activeTokens),
      change: null,
      icon: <Activity className="h-4 w-4" />,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'New Tokens (24h)',
      value: formatNumber(marketData.newTokens24h),
      change: 23.45,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  const highlights = [
    {
      label: 'Top Gainer',
      value: marketData.topGainer.symbol,
      change: marketData.topGainer.change,
      positive: true,
    },
    {
      label: 'Top Loser',
      value: marketData.topLoser.symbol,
      change: marketData.topLoser.change,
      positive: false,
    },
    {
      label: 'Pending Migrations',
      value: marketData.migrationsPending.toString(),
      change: null,
      positive: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Market Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="relative overflow-hidden hover:shadow-card transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={cn('p-2 rounded-md', card.bgColor, card.color)}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold font-mono">
                    {card.value}
                  </div>
                  {card.change !== null && (
                    <div className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      card.change > 0 ? 'text-success' : 'text-danger'
                    )}>
                      {card.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {card.change > 0 ? '+' : ''}{card.change.toFixed(2)}%
                    </div>
                  )}
                </div>
              </CardContent>
              
              {/* Subtle background gradient */}
              <div className={cn(
                'absolute inset-0 opacity-5 bg-gradient-to-br from-transparent to-current',
                card.color
              )} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Market Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Market Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {highlights.map((highlight, index) => (
                <div key={highlight.label} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {highlight.label}:
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-mono',
                      highlight.positive === true && 'text-success border-success/30',
                      highlight.positive === false && 'text-danger border-danger/30'
                    )}
                  >
                    {highlight.value}
                    {highlight.change !== null && (
                      <span className="ml-1">
                        {highlight.change > 0 ? '+' : ''}{highlight.change.toFixed(2)}%
                      </span>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real-time Activity Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
        <span>Live data • Updates every 5 seconds</span>
      </motion.div>
    </div>
  );
}