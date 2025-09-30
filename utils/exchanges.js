// utils/exchanges.js - Assurons-nous du format
const exchangeAdapters = {
  // ✅ ASTER
  aster: async () => {
    try {
      console.log('📡 Fetching Aster...');
      const response = await fetch('https://fapi.asterdex.com/fapi/v1/ticker/24hr');
      const data = await response.json();
      
      const results = data.slice(0, 30).map(item => ({
        pair: item.symbol,
        price: parseFloat(item.lastPrice),
        source: 'aster'
      }));
      
      console.log(`✅ Aster: ${results.length} paires`);
      return results;
    } catch (error) {
      console.error('❌ Erreur Aster:', error.message);
      return [];
    }
  },

  // ✅ HYPERLIQUID
  hyperliquid: async () => {
    try {
      console.log('📡 Fetching Hyperliquid...');
      const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' })
      });
      const data = await response.json();
      
      const results = Object.entries(data).map(([symbol, price]) => ({
        pair: symbol + 'USD',
        price: parseFloat(price),
        source: 'hyperliquid'
      }));
      
      console.log(`✅ Hyperliquid: ${results.length} paires`);
      return results;
    } catch (error) {
      console.error('❌ Erreur Hyperliquid:', error.message);
      return [];
    }
  },

  // ✅ ORDERLY
  orderly: async () => {
    try {
      console.log('📡 Fetching Orderly...');
      const response = await fetch('https://api-evm.orderly.org/v1/public/markets');
      const data = await response.json();
      
      if (data.data) {
        const results = data.data.map(item => ({
          pair: item.symbol,
          price: parseFloat(item.index_price || item.mark_price),
          source: 'orderly'
        }));
        
        console.log(`✅ Orderly: ${results.length} paires`);
        return results;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur Orderly:', error.message);
      return [];
    }
  },

  // ✅ BACKPACK
  backpack: async () => {
    try {
      console.log('📡 Fetching Backpack...');
      const response = await fetch('https://api.backpack.exchange/api/v1/tickers');
      const data = await response.json();
      
      const results = Object.entries(data).map(([symbol, info]) => ({
        pair: symbol,
        price: parseFloat(info.lastPrice),
        source: 'backpack'
      }));
      
      console.log(`✅ Backpack: ${results.length} paires`);
      return results;
    } catch (error) {
      console.error('❌ Erreur Backpack:', error.message);
      return [];
    }
  },

  // ⚠️ PARADEX - Désactivé temporairement
  paradex: async () => {
    console.log('⚠️ Paradex désactivé (DNS issues)');
    return [];
  }
};

export default exchangeAdapters;
