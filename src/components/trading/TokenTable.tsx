import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Star,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTokens, setSortBy, setSelectedToken, updateTokenPrices, Token } from '@/store/slices/tokenSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { TokenDetailModal } from './TokenDetailModal';
import { cn } from '@/lib/utils';

interface TokenTableProps {
  category?: Token['category'];
  className?: string;
}

export function TokenTable({ category, className }: TokenTableProps) {
  const dispatch = useAppDispatch();
  const { filteredTokens, loading, sortBy, sortOrder, realTimeUpdates } = useAppSelector(state => state.tokens);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTokens(category));
  }, [dispatch, category]);

  // Real-time price updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      dispatch(updateTokenPrices());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [dispatch, realTimeUpdates]);

  const handleSort = (column: keyof Token) => {
    const newSortOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
    dispatch(setSortBy({ sortBy: column, sortOrder: newSortOrder }));
  };

  const handleTokenClick = (token: Token) => {
    setSelectedTokenId(token.id);
    dispatch(setSelectedToken(token));
  };

  const handleQuickBuy = (token: Token, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addNotification({
      type: 'success',
      title: 'Quick Buy Executed',
      message: `Successfully bought ${token.symbol} at $${token.price.toFixed(6)}`,
    }));
  };

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

  const getRiskBadgeVariant = (risk: Token['riskLevel']) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const PriceCell = ({ token, className }: { token: Token; className?: string }) => {
    const [prevPrice, setPrevPrice] = useState(token.price);
    const [flashDirection, setFlashDirection] = useState<'up' | 'down' | null>(null);

    useEffect(() => {
      if (token.price !== prevPrice) {
        setFlashDirection(token.price > prevPrice ? 'up' : 'down');
        setPrevPrice(token.price);
        
        const timer = setTimeout(() => setFlashDirection(null), 600);
        return () => clearTimeout(timer);
      }
    }, [token.price, prevPrice]);

    return (
      <motion.div
        className={cn(
          'font-mono transition-all duration-300',
          flashDirection === 'up' && 'price-flash-up',
          flashDirection === 'down' && 'price-flash-down',
          className
        )}
        animate={flashDirection ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {formatNumber(token.price, { currency: true })}
      </motion.div>
    );
  };

  const ChangeCell = ({ change }: { change: number }) => (
    <div className={cn(
      'flex items-center gap-1 font-mono',
      change > 0 ? 'price-up' : change < 0 ? 'price-down' : 'price-neutral'
    )}>
      {change > 0 ? (
        <TrendingUp className="h-3 w-3" />
      ) : change < 0 ? (
        <TrendingDown className="h-3 w-3" />
      ) : null}
      {change > 0 ? '+' : ''}{change.toFixed(2)}%
    </div>
  );

  const SortableHeader = ({ column, children }: { column: keyof Token; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-2 font-semibold text-muted-foreground hover:text-foreground"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === column && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-1"
          >
            {sortOrder === 'desc' ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </motion.div>
        )}
      </div>
    </Button>
  );

  if (loading && filteredTokens.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {/* Table Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">
              {category === 'new-pairs' && 'New Pairs'}
              {category === 'final-stretch' && 'Final Stretch'}
              {category === 'migrated' && 'Recently Migrated'}
              {!category && 'All Tokens'}
            </h2>
            <Badge variant="outline" className="font-mono">
              {filteredTokens.length} tokens
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Filter tokens</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => dispatch(fetchTokens(category))}
                  disabled={loading}
                >
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Table settings</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-table-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-table-header">
                <tr className="border-b border-table-border">
                  <th className="px-4 py-3 text-left">
                    <SortableHeader column="name">Token</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortableHeader column="price">Price</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortableHeader column="priceChange24h">24h Change</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortableHeader column="volume24h">Volume</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortableHeader column="marketCap">Market Cap</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortableHeader column="holders">Holders</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortableHeader column="createdAt">Age</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTokens.map((token, index) => (
                    <motion.tr
                      key={token.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'border-b border-table-border bg-table-row hover:bg-table-row-hover cursor-pointer transition-colors',
                        hoveredRow === token.id && 'bg-table-row-hover'
                      )}
                      onMouseEnter={() => setHoveredRow(token.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => handleTokenClick(token)}
                    >
                      {/* Token Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={token.imageUrl} alt={token.symbol} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {token.symbol.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{token.symbol}</span>
                              {token.verified && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  ✓
                                </Badge>
                              )}
                              <Badge 
                                variant={getRiskBadgeVariant(token.riskLevel)}
                                className="text-xs px-1 py-0"
                              >
                                {token.riskLevel}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-32">
                              {token.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <PriceCell token={token} />
                      </td>

                      {/* 24h Change */}
                      <td className="px-4 py-3 text-right">
                        <ChangeCell change={token.priceChange24h} />
                      </td>

                      {/* Volume */}
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(token.volume24h, { currency: true, compact: true })}
                      </td>

                      {/* Market Cap */}
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(token.marketCap, { currency: true, compact: true })}
                      </td>

                      {/* Holders */}
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(token.holders, { compact: true })}
                      </td>

                      {/* Age */}
                      <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                        {formatTimeAgo(token.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTokenClick(token);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                          </Tooltip>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 bg-gradient-primary text-primary-foreground hover:opacity-90"
                            onClick={(e) => handleQuickBuy(token, e)}
                          >
                            Buy
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                Add to Watchlist
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View Chart</DropdownMenuItem>
                              <DropdownMenuItem>Set Alert</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Token Detail Modal */}
        <TokenDetailModal
          isOpen={!!selectedTokenId}
          onClose={() => {
            setSelectedTokenId(null);
            dispatch(setSelectedToken(null));
          }}
          tokenId={selectedTokenId}
        />
      </div>
    </TooltipProvider>
  );
}