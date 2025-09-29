// utils/exchanges.js - Version temporaire avec données simulées réalistes

const exchangeAdapters = {
  // Hyperliquid - API réelle qui fonctionne
  hyperliquid: async () => {
    try {
      const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' })
      });
      const data = await response.json();
      
      return Object.entries(data).slice(0, 15).map(([symbol, price]) => ({
        symbol: symbol,
        price: parseFloat(price),
        exchange: 'Hyperliquid',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Hyperliquid API error:', error);
      return [];
    }
  },

  // Orderly - API réelle qui fonctionne
  orderly: async () => {
    try {
      const response = await fetch('https://api-evm.orderly.org/v1/public/futures');
      const data = await response.json();
      
      return data.data.rows.slice(0, 15).map(item => ({
        symbol: item.symbol.replace('_PERP', '').replace('_', '-'),
        price: parseFloat(item.mark_price),
        exchange: 'Orderly',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Orderly API error:', error);
      return [];
    }
  },

  // Backpack - API réelle qui fonctionne
  backpack: async () => {
    try {
      const response = await fetch('https://api.backpack.exchange/api/v1/tickers');
      const data = await response.json();
      
      return Object.values(data)
        .filter(ticker => ticker.symbol.includes('_USDC'))
        .slice(0, 10)
        .map(ticker => ({
          symbol: ticker.symbol.replace('_USDC', ''),
          price: parseFloat(ticker.lastPrice),
          exchange: 'Backpack',
          timestamp: Date.now()
        }));
    } catch (error) {
      console.error('Backpack API error:', error);
      return [];
    }
  },

  // Les autres en mode simulé temporaire (on cherchera les vraies APIs après)
  paradex: () => generateSimulatedPrices('Paradex'),
  vest: () => generateSimulatedPrices('Vest'),
  extended: () => generateSimulatedPrices('Extended'),
  hibachi: () => generateSimulatedPrices('Hibachi'),
  aster: () => generateSimulatedPrices('Aster'),
  pacifica: () => generateSimulatedPrices('Pacifica')
};

// Fonction pour générer des prix simulés réalistes
function generateSimulatedPrices(exchangeName) {
  const baseSymbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB'];
  const basePrices = {
    'BTC': 67000 + Math.random() * 2000,
    'ETH': 2650 + Math.random() * 200, 
    'SOL': 155 + Math.random() * 20,
    'AVAX': 28 + Math.random() * 5,
    'ARB': 0.95 + Math.random() * 0.3
  };

  return baseSymbols.map(symbol => ({
    symbol,
    price: basePrices[symbol] * (1 + (Math.random() - 0.5) * 0.02), // Variation ±1%
    exchange: exchangeName,
    timestamp: Date.now()
  }));
}

export { exchangeAdapters };
export default exchangeAdapters;
