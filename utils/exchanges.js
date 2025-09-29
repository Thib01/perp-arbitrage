// utils/exchanges.js - VRAIES APIs PERPÉTUELS DEX

const exchangeAdapters = {
  // Hyperliquid - API officielle perpétuels
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

  // Orderly Network - API officielle
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

  // Paradex (StarkNet) - API officielle
  paradex: async () => {
    try {
      const response = await fetch('https://api.paradex.trade/v1/markets');
      const data = await response.json();
      
      return data.results.slice(0, 10).map(market => ({
        symbol: market.symbol.replace('-USD-PERP', ''),
        price: parseFloat(market.mark_price),
        exchange: 'Paradex',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Paradex API error:', error);
      // Fallback si l'API ne fonctionne pas
      try {
        const fallback = await fetch('https://api.paradex.trade/v1/system/config');
        console.log('Paradex alternative endpoint available');
        return [];
      } catch {
        return [];
      }
    }
  },

  // Backpack Exchange - API officielle
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

  // Vest Finance - API endpoint
  vest: async () => {
    try {
      // Vest n'a pas d'API publique connue, essayons leur endpoint
      const response = await fetch('https://vest.exchange/api/v1/markets', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ArbitrageBot/1.0)'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.slice(0, 10).map(market => ({
          symbol: market.symbol,
          price: parseFloat(market.price),
          exchange: 'Vest',
          timestamp: Date.now()
        }));
      }
      throw new Error('Vest API not accessible');
    } catch (error) {
      console.error('Vest API error:', error);
      // Essayer endpoint GraphQL
      try {
        const graphqlResponse = await fetch('https://api.vest.exchange/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: '{ markets { symbol markPrice } }'
          })
        });
        if (graphqlResponse.ok) {
          const data = await graphqlResponse.json();
          return data.data?.markets?.slice(0, 10).map(market => ({
            symbol: market.symbol,
            price: parseFloat(market.markPrice),
            exchange: 'Vest',
            timestamp: Date.now()
          })) || [];
        }
      } catch {
        return [];
      }
      return [];
    }
  },

  // Extended Protocol - API endpoint  
  extended: async () => {
    try {
      const response = await fetch('https://api.extended.finance/v1/markets');
      
      if (response.ok) {
        const data = await response.json();
        return data.markets.slice(0, 10).map(market => ({
          symbol: market.symbol,
          price: parseFloat(market.mark_price),
          exchange: 'Extended',
          timestamp: Date.now()
        }));
      }
      throw new Error('Extended API not accessible');
    } catch (error) {
      console.error('Extended API error:', error);
      // Essayer endpoint alternatif
      try {
        const altResponse = await fetch('https://extended.finance/api/tickers');
        if (altResponse.ok) {
          const data = await altResponse.json();
          return Object.entries(data).slice(0, 10).map(([symbol, ticker]) => ({
            symbol: symbol.replace('_PERP', ''),
            price: parseFloat(ticker.last),
            exchange: 'Extended',
            timestamp: Date.now()
          }));
        }
      } catch {
        return [];
      }
      return [];
    }
  },

  // Hibachi - API endpoint
  hibachi: async () => {
    try {
      const response = await fetch('https://api.hibachi.finance/v1/perpetuals');
      
      if (response.ok) {
        const data = await response.json();
        return data.slice(0, 10).map(perp => ({
          symbol: perp.symbol,
          price: parseFloat(perp.markPrice),
          exchange: 'Hibachi',
          timestamp: Date.now()
        }));
      }
      throw new Error('Hibachi API not accessible');
    } catch (error) {
      console.error('Hibachi API error:', error);
      // Essayer endpoint alternatif
      try {
        const altResponse = await fetch('https://hibachi.finance/api/markets');
        if (altResponse.ok) {
          const data = await altResponse.json();
          return data.slice(0, 10).map(market => ({
            symbol: market.base_asset,
            price: parseFloat(market.mark_price),
            exchange: 'Hibachi',
            timestamp: Date.now()
          }));
        }
      } catch {
        return [];
      }
      return [];
    }
  },

  // Aster Protocol - API endpoint
  aster: async () => {
    try {
      const response = await fetch('https://api.aster.finance/v1/markets');
      
      if (response.ok) {
        const data = await response.json();
        return data.markets.slice(0, 10).map(market => ({
          symbol: market.symbol.replace('-PERP', ''),
          price: parseFloat(market.markPrice),
          exchange: 'Aster',
          timestamp: Date.now()
        }));
      }
      throw new Error('Aster API not accessible');
    } catch (error) {
      console.error('Aster API error:', error);
      // Essayer GraphQL
      try {
        const graphqlResponse = await fetch('https://aster.finance/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: '{ perpetualMarkets { symbol markPrice } }'
          })
        });
        if (graphqlResponse.ok) {
          const data = await graphqlResponse.json();
          return data.data?.perpetualMarkets?.slice(0, 10).map(market => ({
            symbol: market.symbol,
            price: parseFloat(market.markPrice),
            exchange: 'Aster',
            timestamp: Date.now()
          })) || [];
        }
      } catch {
        return [];
      }
      return[];
    }
  },

  // Pacifica Finance - API endpoint
  pacifica: async () => {
    try {
      const response = await fetch('https://api.pacifica.finance/v1/perps');
      
      if (response.ok) {
        const data = await response.json();
        return data.slice(0, 10).map(perp => ({
          symbol: perp.symbol,
          price: parseFloat(perp.mark_price),
          exchange: 'Pacifica',
          timestamp: Date.now()
        }));
      }
      throw new Error('Pacifica API not accessible');
    } catch (error) {
      console.error('Pacifica API error:', error);
      // Essayer endpoint alternatif
      try {
        const altResponse = await fetch('https://pacifica.finance/api/markets');
        if (altResponse.ok) {
          const data = await altResponse.json();
          return data.slice(0, 10).map(market => ({
            symbol: market.symbol,
            price: parseFloat(market.last_price),
            exchange: 'Pacifica',
            timestamp: Date.now()
          }));
        }
      } catch {
        return [];
      }
      return [];
    }
  }
};

export { exchangeAdapters };
export default exchangeAdapters;
