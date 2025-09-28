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
    
    // Enhanced mock token data generator with realistic trading metrics
    const generateMockTokens = (category?: Token['category'], count: number = 50): Token[] => {
      // Real meme token symbols and names for authenticity
      const tokenData = [
        { symbol: 'Unreal', name: 'Unreal Engine' },
        { symbol: 'fixable', name: 'Fixable Token' },
        { symbol: 'FINAGENT', name: 'Fin Agent AI' },
        { symbol: 'SEEKEN', name: 'SeekGen' },
        { symbol: 'MOLD', name: 'Mold Framework Official' },
        { symbol: 'AYAMI', name: 'Ayasumi' },
        { symbol: 'PEPE', name: 'Pepe the Frog' },
        { symbol: 'SHIB', name: 'Shiba Inu' },
        { symbol: 'DOGE', name: 'Dogecoin' },
        { symbol: 'FLOKI', name: 'Floki Inu' },
        { symbol: 'BABY', name: 'Baby Doge Coin' },
        { symbol: 'WOJAK', name: 'Wojak Finance' },
        { symbol: 'APU', name: 'Apu Apustaja' },
        { symbol: 'BRETT', name: 'Brett Coin' },
        { symbol: 'ANDY', name: 'Andy Warhol' },
        { symbol: 'MOG', name: 'Mog Coin' },
        { symbol: 'POPCAT', name: 'Popcat' },
        { symbol: 'WIF', name: 'dogwifhat' },
        { symbol: 'BONK', name: 'Bonk Inu' },
        { symbol: 'BOME', name: 'Book of Meme' },
        { symbol: 'MEW', name: 'Cat in Dogs World' },
        { symbol: 'NEIRO', name: 'Neiro Ethereum' },
        { symbol: 'GOAT', name: 'Goatseus Maximus' },
        { symbol: 'RETARDIO', name: 'Retardio' },
        { symbol: 'GIGA', name: 'Giga Chad' },
        { symbol: 'PONKE', name: 'Ponke' },
        { symbol: 'MYRO', name: 'Myro' },
        { symbol: 'PUPS', name: 'Bitcoin Puppies' },
        { symbol: 'SEAL', name: 'Seal' },
        { symbol: 'KOMA', name: 'Koma Inu' }
      ];

      const riskLevels: Token['riskLevel'][] = ['low', 'medium', 'high'];
      
      return Array.from({ length: count }, (_, i) => {
        const tokenInfo = tokenData[i % tokenData.length];
        const actualCategory = category || (['new-pairs', 'final-stretch', 'migrated'] as Token['category'][])[Math.floor(Math.random() * 3)];
        
        // Generate realistic price ranges based on category
        let price: number;
        let marketCapMultiplier: number;
        let migrationProgress: number;
        
        switch (actualCategory) {
          case 'new-pairs':
            price = Math.random() * 0.01; // Very low prices for new tokens
            marketCapMultiplier = 10000 + Math.random() * 90000; // 10K - 100K
            migrationProgress = Math.random() * 30; // 0-30% progress
            break;
          case 'final-stretch':
            price = Math.random() * 0.1; // Medium prices
            marketCapMultiplier = 100000 + Math.random() * 400000; // 100K - 500K
            migrationProgress = 70 + Math.random() * 30; // 70-100% progress
            break;
          case 'migrated':
            price = Math.random() * 1; // Higher prices for migrated
            marketCapMultiplier = 500000 + Math.random() * 4500000; // 500K - 5M
            migrationProgress = 100; // Complete
            break;
          default:
            price = Math.random() * 0.1;
            marketCapMultiplier = 50000 + Math.random() * 200000;
            migrationProgress = Math.random() * 100;
        }
        
        // Generate realistic volume based on market cap
        const marketCap = price * marketCapMultiplier;
        const volume24h = marketCap * (0.1 + Math.random() * 2); // 10%-200% of market cap
        
        // Generate more realistic price changes
        const volatility = actualCategory === 'new-pairs' ? 3 : actualCategory === 'final-stretch' ? 2 : 1;
        const priceChange24h = (Math.random() - 0.5) * 100 * volatility;
        
        return {
          id: `${tokenInfo.symbol.toLowerCase()}-${i}`,
          symbol: `${tokenInfo.symbol}${i > 29 ? Math.floor(i/30) : ''}`,
          name: `${tokenInfo.name}${i > 29 ? ` ${Math.floor(i/30)}` : ''}`,
          price,
          priceChange24h,
          volume24h,
          marketCap,
          fdv: marketCap * (1.2 + Math.random() * 0.8), // FDV 120%-200% of market cap
          holders: Math.floor(Math.random() * 50000),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          migrationProgress,
          category: actualCategory,
          verified: Math.random() > 0.8, // 20% verified rate
          riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
          liquidity: marketCap * (0.05 + Math.random() * 0.15), // 5%-20% of market cap
          tradingVolume: volume24h,
          priceHistory: Array.from({ length: 4 }, () => price * (0.8 + Math.random() * 0.4)),
          lastUpdate: new Date().toISOString(),
          imageUrl: `/tokens/${tokenInfo.symbol.toLowerCase() === 'pepe' ? 'pepe.png' : 
                           tokenInfo.symbol.toLowerCase() === 'wojak' ? 'wojak.png' :
                           tokenInfo.symbol.toLowerCase() === 'moon' ? 'moon.png' :
                           `token${(i % 9) + 4}.png`}`
        };
      });
    };

    const mockTokens = generateMockTokens(category, 30);

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