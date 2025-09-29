// utils/exchanges.js
const exchangeAdapters = {
  // Hyperliquid - API réelle
  hyperliquid: async () => {
    console.log('Fetching Hyperliquid prices...');
    try {
      const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      console.log('Hyperliquid data:', Object.keys(data).length, 'pairs');
      
      return Object.entries(data).slice(0, 10).map(([symbol, price]) => ({
        symbol: symbol.replace('/', '-'),
        price: parseFloat(price),
        exchange: 'Hyperliquid',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Hyperliquid error:', error);
      return [];
    }
  },

  // Binance - API publique (référence fiable)
  binance: async () => {
    console.log('Fetching Binance prices...');
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      // Filtrer les paires USDT principales
      const usdtPairs = data
        .filter(item => item.symbol.endsWith('USDT'))
        .filter(item => ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT', 'LINKUSDT', 'UNIUSDT', 'ADAUSDT', 'DOTUSDT'].includes(item.symbol))
        .map(item => ({
          symbol: item.symbol.replace('USDT', '-USDT'),
          price: parseFloat(item.price),
          exchange: 'Binance',
          timestamp: Date.now()
        }));

      console.log('Binance data:', usdtPairs.length, 'pairs');
      return usdtPairs;
    } catch (error) {
      console.error('Binance error:', error);
      return [];
    }
  },

  // CoinGecko comme source de référence
  coingecko: async () => {
    console.log('Fetching CoinGecko prices...');
    try {
      const coins = ['bitcoin', 'ethereum', 'solana', 'avalanche-2', 'chainlink', 'uniswap', 'cardano', 'polkadot'];
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      const mapping = {
        'bitcoin': 'BTC-USDT',
        'ethereum': 'ETH-USDT',
        'solana': 'SOL-USDT',
        'avalanche-2': 'AVAX-USDT',
        'chainlink': 'LINK-USDT',
        'uniswap': 'UNI-USDT',
        'cardano': 'ADA-USDT',
        'polkadot': 'DOT-USDT'
      };
      
      const result = Object.entries(data).map(([coinId, priceData]) => ({
        symbol: mapping[coinId],
        price: priceData.usd,
        exchange: 'CoinGecko',
        timestamp: Date.now()
      }));

      console.log('CoinGecko data:', result.length, 'pairs');
      return result;
    } catch (error) {
      console.error('CoinGecko error:', error);
      return [];
    }
  },

  // Simulateurs avec variation réaliste (basés sur CoinGecko)
  generic: async (exchangeName) => {
    console.log(`Fetching ${exchangeName} simulated prices...`);
    try {
      const coins = ['bitcoin', 'ethereum', 'solana', 'avalanche-2', 'chainlink', 'uniswap'];
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      const mapping = {
        'bitcoin': 'BTC-USDT',
        'ethereum': 'ETH-USDT',
        'solana': 'SOL-USDT',
        'avalanche-2': 'AVAX-USDT',
        'chainlink': 'LINK-USDT',
        'uniswap': 'UNI-USDT'
      };
      
      // Ajouter une variation réaliste de ±0.1% à ±0.5%
      const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
      
      const result = Object.entries(data).map(([coinId, priceData]) => ({
        symbol: mapping[coinId],
        price: priceData.usd * (1 + variation),
        exchange: exchangeName,
        timestamp: Date.now()
      }));

      console.log(`${exchangeName} data:`, result.length, 'pairs');
      return result;
    } catch (error) {
      console.error(`${exchangeName} error:`, error);
      return [];
    }
  }
};

// Export pour Next.js
export { exchangeAdapters };
export default exchangeAdapters;
