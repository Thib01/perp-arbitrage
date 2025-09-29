// utils/exchanges.js - VRAIES APIs PERPÉTUELS DEX

const exchanges = {
  paradex: async () => {
    try {
      const response = await fetch('https://api.prod.paradex.trade/v1/markets');
      const data = await response.json();
      
      return data.results.slice(0, 15).map(market => ({
        symbol: market.symbol.replace('-PERP', '').replace('-USD', ''),
        price: parseFloat(market.oracle_price_signed || market.mark_price),
        exchange: 'Paradex',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Paradex API error:', error);
      return [];
    }
  },

  backpack: async () => {
    try {
      const response = await fetch('https://api.backpack.exchange/api/v1/tickers');
      const data = await response.json();
      
      return Object.entries(data).slice(0, 15).map(([symbol, ticker]) => ({
        symbol: symbol.replace('_USDC', '').replace('_USD', ''),
        price: parseFloat(ticker.lastPrice),
        exchange: 'Backpack',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Backpack API error:', error);
      return [];
    }
  },

  aster: async () => {
    try {
      const response = await fetch('https://fapi.asterdex.com/fapi/v1/ticker/price');
      const data = await response.json();
      
      return data.slice(0, 15).map(ticker => ({
        symbol: ticker.symbol.replace('USDT', '').replace('USDC', ''),
        price: parseFloat(ticker.price),
        exchange: 'Aster',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Aster API error:', error);
      return [];
    }
  },

  vest: async () => {
    try {
      const response = await fetch('VOTRE_API_VEST_ICI');
      const data = await response.json();
      
      return data.slice(0, 15).map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.price),
        exchange: 'Vest',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Vest API error:', error);
      return [];
    }
  },

  extended: async () => {
    try {
      const response = await fetch('https://api.starknet.extended.exchange/api/v1/info/markets');
      const data = await response.json();
      
      return data.slice(0, 15).map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.price),
        exchange: 'Extended',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Extended API error:', error);
      return [];
    }
  },

  hyperliquid: async () => {
    try {
      const response = await fetch('VOTRE_API_HYPERLIQUID_ICI');
      const data = await response.json();
      
      return data.slice(0, 15).map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.price),
        exchange: 'Hyperliquid',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Hyperliquid API error:', error);
      return [];
    }
  },

  orderly: async () => {
    try {
      const response = await fetch('VOTRE_API_ORDERLY_ICI');
      const data = await response.json();
      
      return data.slice(0, 15).map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.price),
        exchange: 'Orderly',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Orderly API error:', error);
      return [];
    }
  },

  hibachi: async () => {
    try {
      const response = await fetch('VOTRE_API_HIBACHI_ICI');
      const data = await response.json();
      
      return data.slice(0, 15).map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.price),
        exchange: 'Hibachi',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Hibachi API error:', error);
      return [];
    }
  },

  pacifica: async () => {
    try {
      const response = await fetch('VOTRE_API_PACIFICA_ICI');
      const data = await response.json();
      
      return data.slice(0, 15).map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.price),
        exchange: 'Pacifica',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Pacifica API error:', error);
      return [];
    }
  }
};

export async function fetchAllPrices() {
  const exchangeNames = ['paradex', 'backpack', 'aster', 'vest', 'extended', 'hyperliquid', 'orderly', 'hibachi', 'pacifica'];
  const promises = exchangeNames.map(name => exchanges[name]());
  const results = await Promise.all(promises);
  
  return results.flat();
}
