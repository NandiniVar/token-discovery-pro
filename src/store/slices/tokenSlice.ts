import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  holders: number;
  createdAt: string;
  migrationProgress: number;
  category: 'new-pairs' | 'final-stretch' | 'migrated';
  imageUrl: string;
  verified: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  liquidity: number;
  tradingVolume: number;
  priceHistory: number[];
  lastUpdate: string;
}

export interface TokenState {
  tokens: Token[];
  filteredTokens: Token[];
  loading: boolean;
  error: string | null;
  sortBy: keyof Token;
  sortOrder: 'asc' | 'desc';
  filterCategory: 'all' | Token['category'];
  searchQuery: string;
  selectedToken: Token | null;
  realTimeUpdates: boolean;
}

const initialState: TokenState = {
  tokens: [],
  filteredTokens: [],
  loading: false,
  error: null,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  filterCategory: 'all',
  searchQuery: '',
  selectedToken: null,
  realTimeUpdates: true,
};

// Async thunk for fetching tokens
export const fetchTokens = createAsyncThunk(
  'tokens/fetchTokens',
  async (category?: Token['category']) => {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockTokens: Token[] = [
      {
        id: '1',
        symbol: 'PEPE',
        name: 'Pepe Token',
        price: 0.000001234,
        priceChange24h: 15.67,
        volume24h: 2847392,
        marketCap: 12400000,
        fdv: 15600000,
        holders: 8924,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        migrationProgress: 0,
        category: 'new-pairs',
        imageUrl: '/tokens/pepe.png',
        verified: false,
        riskLevel: 'high',
        liquidity: 456789,
        tradingVolume: 234567,
        priceHistory: [0.000001100, 0.000001150, 0.000001200, 0.000001234],
        lastUpdate: new Date().toISOString(),
      },
      {
        id: '2',
        symbol: 'WOJAK',
        name: 'Wojak Token',
        price: 0.0045,
        priceChange24h: -8.23,
        volume24h: 1456782,
        marketCap: 8900000,
        fdv: 12300000,
        holders: 5647,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        migrationProgress: 87,
        category: 'final-stretch',
        imageUrl: '/tokens/wojak.png',
        verified: true,
        riskLevel: 'medium',
        liquidity: 789123,
        tradingVolume: 567890,
        priceHistory: [0.0049, 0.0047, 0.0046, 0.0045],
        lastUpdate: new Date().toISOString(),
      },
      {
        id: '3',
        symbol: 'MOON',
        name: 'Moon Shot',
        price: 1.234,
        priceChange24h: 234.56,
        volume24h: 5847392,
        marketCap: 45600000,
        fdv: 78900000,
        holders: 15678,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        migrationProgress: 100,
        category: 'migrated',
        imageUrl: '/tokens/moon.png',
        verified: true,
        riskLevel: 'low',
        liquidity: 2345678,
        tradingVolume: 1234567,
        priceHistory: [0.456, 0.789, 1.012, 1.234],
        lastUpdate: new Date().toISOString(),
      },
      // Add more mock tokens for each category
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `token-${i + 4}`,
        symbol: `TKN${i + 4}`,
        name: `Token ${i + 4}`,
        price: Math.random() * 10,
        priceChange24h: (Math.random() - 0.5) * 100,
        volume24h: Math.random() * 10000000,
        marketCap: Math.random() * 100000000,
        fdv: Math.random() * 150000000,
        holders: Math.floor(Math.random() * 50000),
        createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(),
        migrationProgress: Math.floor(Math.random() * 100),
        category: ['new-pairs', 'final-stretch', 'migrated'][Math.floor(Math.random() * 3)] as Token['category'],
        imageUrl: `/tokens/token${i + 4}.png`,
        verified: Math.random() > 0.5,
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as Token['riskLevel'],
        liquidity: Math.random() * 5000000,
        tradingVolume: Math.random() * 2000000,
        priceHistory: Array.from({ length: 4 }, () => Math.random() * 10),
        lastUpdate: new Date().toISOString(),
      }))
    ];

    return category ? mockTokens.filter(token => token.category === category) : mockTokens;
  }
);

// Async thunk for real-time price updates
export const updateTokenPrices = createAsyncThunk(
  'tokens/updatePrices',
  async (_, { getState }) => {
    const state = getState() as { tokens: TokenState };
    const updatedTokens = state.tokens.tokens.map(token => ({
      ...token,
      price: token.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% change
      priceChange24h: token.priceChange24h + (Math.random() - 0.5) * 2,
      lastUpdate: new Date().toISOString(),
    }));
    return updatedTokens;
  }
);

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<{ sortBy: keyof Token; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.filteredTokens = sortTokens(state.filteredTokens, action.payload.sortBy, action.payload.sortOrder);
    },
    setFilterCategory: (state, action: PayloadAction<TokenState['filterCategory']>) => {
      state.filterCategory = action.payload;
      state.filteredTokens = filterAndSortTokens(state.tokens, action.payload, state.searchQuery, state.sortBy, state.sortOrder);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredTokens = filterAndSortTokens(state.tokens, state.filterCategory, action.payload, state.sortBy, state.sortOrder);
    },
    setSelectedToken: (state, action: PayloadAction<Token | null>) => {
      state.selectedToken = action.payload;
    },
    toggleRealTimeUpdates: (state) => {
      state.realTimeUpdates = !state.realTimeUpdates;
    },
    updateToken: (state, action: PayloadAction<Token>) => {
      const index = state.tokens.findIndex(token => token.id === action.payload.id);
      if (index !== -1) {
        state.tokens[index] = action.payload;
        state.filteredTokens = filterAndSortTokens(state.tokens, state.filterCategory, state.searchQuery, state.sortBy, state.sortOrder);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens = action.payload;
        state.filteredTokens = filterAndSortTokens(action.payload, state.filterCategory, state.searchQuery, state.sortBy, state.sortOrder);
      })
      .addCase(fetchTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tokens';
      })
      .addCase(updateTokenPrices.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.filteredTokens = filterAndSortTokens(action.payload, state.filterCategory, state.searchQuery, state.sortBy, state.sortOrder);
      });
  },
});

// Helper functions
function sortTokens(tokens: Token[], sortBy: keyof Token, sortOrder: 'asc' | 'desc'): Token[] {
  return [...tokens].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    return 0;
  });
}

function filterAndSortTokens(
  tokens: Token[],
  category: TokenState['filterCategory'],
  searchQuery: string,
  sortBy: keyof Token,
  sortOrder: 'asc' | 'desc'
): Token[] {
  let filtered = tokens;
  
  if (category !== 'all') {
    filtered = filtered.filter(token => token.category === category);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(token => 
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query)
    );
  }
  
  return sortTokens(filtered, sortBy, sortOrder);
}

export const {
  setSortBy,
  setFilterCategory,
  setSearchQuery,
  setSelectedToken,
  toggleRealTimeUpdates,
  updateToken,
} = tokenSlice.actions;

export default tokenSlice.reducer;