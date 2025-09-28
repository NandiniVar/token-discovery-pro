import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Activity, 
  Zap,
  Bell,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveTab } from '@/store/slices/uiSlice';
import { toggleRealTimeUpdates } from '@/store/slices/tokenSlice';
import { setSearchQuery, setFilterCategory } from '@/store/slices/tokenSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TokenTable } from './TokenTable';
import { MarketOverview } from './MarketOverview';
import { NotificationCenter } from './NotificationCenter';
import { cn } from '@/lib/utils';

export function TradingDashboard() {
  const dispatch = useAppDispatch();
  const { activeTab, autoRefresh } = useAppSelector(state => state.ui);
  const { searchQuery, filterCategory } = useAppSelector(state => state.tokens);
  const [showNotifications, setShowNotifications] = useState(false);

  const tabs = [
    {
      id: 'new-pairs' as const,
      label: 'New Pairs',
      icon: <Zap className="h-4 w-4" />,
      description: 'Recently created tokens',
      color: 'text-primary',
    },
    {
      id: 'final-stretch' as const,
      label: 'Final Stretch',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Nearing migration to Raydium',
      color: 'text-warning',
    },
    {
      id: 'migrated' as const,
      label: 'Migrated',
      icon: <Activity className="h-4 w-4" />,
      description: 'Recently migrated to Raydium',
      color: 'text-success',
    },
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    dispatch(setActiveTab(tabId));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleFilterChange = (category: typeof filterCategory) => {
    dispatch(setFilterCategory(category));
  };

  const toggleAutoRefresh = () => {
    dispatch(toggleRealTimeUpdates());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-primary">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Pulse</h1>
                  <p className="text-sm text-muted-foreground">Live Token Discovery</p>
                </div>
              </motion.div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Filter
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleFilterChange('all')}
                    className={cn(filterCategory === 'all' && 'bg-accent')}
                  >
                    All Tokens
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleFilterChange('new-pairs')}
                    className={cn(filterCategory === 'new-pairs' && 'bg-accent')}
                  >
                    New Pairs
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleFilterChange('final-stretch')}
                    className={cn(filterCategory === 'final-stretch' && 'bg-accent')}
                  >
                    Final Stretch
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleFilterChange('migrated')}
                    className={cn(filterCategory === 'migrated' && 'bg-accent')}
                  >
                    Migrated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Auto Refresh Toggle */}
              <div className="flex items-center gap-2">
                <label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
                  Auto-refresh
                </label>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={toggleAutoRefresh}
                />
              </div>

              {/* Notifications */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* Settings */}
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Market Overview */}
      <div className="container mx-auto px-4 py-6">
        <MarketOverview />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 h-auto p-1">
              {tabs.map((tab, index) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-2 py-3 px-4 data-[state=active]:bg-accent/50"
                >
                  <motion.div
                    className={cn('flex items-center gap-2', tab.color)}
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    animate={{ 
                      scale: activeTab === tab.id ? 1.1 : 0.9,
                      opacity: activeTab === tab.id ? 1 : 0.7 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.icon}
                    <span className="font-semibold">{tab.label}</span>
                  </motion.div>
                  <span className="text-xs text-muted-foreground">
                    {tab.description}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            <TabsContent value="new-pairs" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TokenTable category="new-pairs" />
              </motion.div>
            </TabsContent>

            <TabsContent value="final-stretch" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TokenTable category="final-stretch" />
              </motion.div>
            </TabsContent>

            <TabsContent value="migrated" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TokenTable category="migrated" />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}