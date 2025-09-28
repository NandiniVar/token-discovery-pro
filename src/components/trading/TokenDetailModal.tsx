import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  Copy, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TokenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string | null;
}

export function TokenDetailModal({ isOpen, onClose, tokenId }: TokenDetailModalProps) {
  const tokens = useAppSelector(state => state.tokens.tokens);
  
  const token = useMemo(() => {
    if (!tokenId) return null;
    return tokens.find(t => t.id === tokenId) || null;
  }, [tokens, tokenId]);

  if (!token) return null;

  const formatNumber = (value: number, options?: { currency?: boolean; compact?: boolean }) => {
    const { currency = false, compact = false } = options || {};
    
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
        minimumFractionDigits: value < 0.01 ? 6 : 2,
        maximumFractionDigits: value < 0.01 ? 6 : 2,
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-danger';
      default: return 'text-neutral';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Shield className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'new-pairs': return 'bg-primary/10 text-primary border-primary/20';
      case 'final-stretch': return 'bg-warning/10 text-warning border-warning/20';
      case 'migrated': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'new-pairs': return 'New Pair';
      case 'final-stretch': return 'Final Stretch';
      case 'migrated': return 'Migrated';
      default: return category;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={token.imageUrl} alt={token.symbol} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {token.symbol.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{token.name}</h2>
                  {token.verified && (
                    <Badge variant="outline" className="text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{token.symbol}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price and Change */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-mono">
                {formatNumber(token.price, { currency: true })}
              </div>
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                token.priceChange24h > 0 ? 'text-success' : token.priceChange24h < 0 ? 'text-danger' : 'text-neutral'
              )}>
                {token.priceChange24h > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : token.priceChange24h < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}% (24h)
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button className="bg-gradient-success hover:opacity-90">
                Quick Buy
              </Button>
              <Button variant="outline">
                Add to Watchlist
              </Button>
            </div>
          </div>

          {/* Categories and Risk */}
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(token.category)}>
              {getCategoryLabel(token.category)}
            </Badge>
            <Badge variant="outline" className={cn('flex items-center gap-1', getRiskColor(token.riskLevel))}>
              {getRiskIcon(token.riskLevel)}
              {token.riskLevel} Risk
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeAgo(token.createdAt)}
            </Badge>
          </div>

          {/* Migration Progress (for final-stretch tokens) */}
          {token.category === 'final-stretch' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Migration Progress</span>
                <span className="font-mono">{token.migrationProgress}%</span>
              </div>
              <Progress value={token.migrationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {100 - token.migrationProgress}% remaining until Raydium migration
              </p>
            </div>
          )}

          <Separator />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="space-y-1 p-3 rounded-lg bg-card border border-border hover:border-border-hover transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Market Cap
              </div>
              <div className="font-mono font-semibold">
                {formatNumber(token.marketCap, { currency: true, compact: true })}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-1 p-3 rounded-lg bg-card border border-border hover:border-border-hover transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                Volume 24h
              </div>
              <div className="font-mono font-semibold">
                {formatNumber(token.volume24h, { currency: true, compact: true })}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-1 p-3 rounded-lg bg-card border border-border hover:border-border-hover transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                Holders
              </div>
              <div className="font-mono font-semibold">
                {formatNumber(token.holders, { compact: true })}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-1 p-3 rounded-lg bg-card border border-border hover:border-border-hover transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                FDV
              </div>
              <div className="font-mono font-semibold">
                {formatNumber(token.fdv, { currency: true, compact: true })}
              </div>
            </motion.div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-sm">Liquidity Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Liquidity</span>
                  <span className="font-mono">{formatNumber(token.liquidity, { currency: true, compact: true })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trading Volume</span>
                  <span className="font-mono">{formatNumber(token.tradingVolume, { currency: true, compact: true })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-sm">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on DEX
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Contract
                </Button>
              </div>
            </div>
          </div>

          {/* Price History Chart Placeholder */}
          <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-sm">Price History</h3>
            <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mr-2" />
              Price chart coming soon
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {getRiskIcon(token.riskLevel)}
              Risk Assessment
            </h3>
            <div className="text-sm text-muted-foreground">
              {token.riskLevel === 'low' && 'This token has been verified and shows stable trading patterns with good liquidity.'}
              {token.riskLevel === 'medium' && 'This token shows moderate risk factors. Trade with caution and do your own research.'}
              {token.riskLevel === 'high' && 'This token is high risk. Only invest what you can afford to lose.'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}