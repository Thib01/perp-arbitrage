import axios from 'axios';

export const EXCHANGES = {
  HYPERLIQUID: {
    name: 'Hyperliquid',
    url: 'https://api.hyperliquid.xyz/info',
    color: '#00D2FF'
  },
  PARADEX: {
    name: 'Paradex', 
    url: 'https://api.paradex.trade/v1',
    color: '#FF6B35'
  }
};

// Fonction pour simuler les données des échanges
const generateMockData = (exchangeName) => {
  const symbols = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'AVAX-USDT', 'MATIC-USDT'];
  const basePrices = {
    'BTC-USDT': 45000,
    'ETH-USDT': 2500,
    'SOL-USDT': 100,
    'AVAX-USDT': 35,
    'MATIC-USDT': 0.8
  };
  
  return symbols.map(symbol => ({
    symbol,
    price: basePrices[symbol] * (0.95 + Math.random() * 0.1), // Variation de ±5%
    exchange: exchangeName,
    timestamp: Date.now()
  }));
};

export const exchangeAdapters = {
  hyperliquid: async () => {
    try {
      // Pour le moment, on utilise des données simulées
      // Plus tard, vous pourrez remplacer par la vraie API
      return generateMockData('Hyperliquid');
    } catch (error) {
      console.error('Hyperliquid error:', error);
      return [];
    }
  },

  paradex: async () => {
    return generateMockData('Paradex');
  },

  vest: async () => {
    return generateMockData('Vest');
  },

  extended: async () => {
    return generateMockData('Extended');
  },

  backpack: async () => {
    return generateMockData('Backpack');
  },

  orderly: async () => {
    return generateMockData('Orderly');
  },

  hibachi: async () => {
    return generateMockData('Hibachi');
  },

  aster: async () => {
    return generateMockData('Aster');
  },

  pacifica: async () => {
    return generateMockData('Pacifica');
  }
};
