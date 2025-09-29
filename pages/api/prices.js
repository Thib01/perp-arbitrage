import { exchangeAdapters } from '../../utils/exchanges';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const exchanges = [
      'hyperliquid',
      'paradex', 
      'vest',
      'extended',
      'backpack',
      'orderly',
      'hibachi',
      'aster',
      'pacifica'
    ];

    console.log('Fetching prices from exchanges...');

    const pricePromises = exchanges.map(async (exchange) => {
      try {
        return await exchangeAdapters[exchange]();
      } catch (error) {
        console.error(`Error fetching ${exchange}:`, error);
        return [];
      }
    });

    const allPrices = await Promise.all(pricePromises);
    const flatPrices = allPrices.flat();

    // Grouper les prix par symbole
    const groupedPrices = {};
    flatPrices.forEach(price => {
      if (!groupedPrices[price.symbol]) {
        groupedPrices[price.symbol] = [];
      }
      groupedPrices[price.symbol].push(price);
    });

    // Calculer les opportunités d'arbitrage
    const arbitrageOpportunities = [];
    
    Object.entries(groupedPrices).forEach(([symbol, prices]) => {
      if (prices.length < 2) return;

      const sortedPrices = prices.sort((a, b) => a.price - b.price);
      const lowest = sortedPrices[0];
      const highest = sortedPrices[sortedPrices.length - 1];
      
      const priceDiff = highest.price - lowest.price;
      const percentageDiff = (priceDiff / lowest.price) * 100;

      if (percentageDiff > 0.1) {
        arbitrageOpportunities.push({
          symbol,
          buyExchange: lowest.exchange,
          sellExchange: highest.exchange,
          buyPrice: lowest.price,
          sellPrice: highest.price,
          priceDiff,
          percentageDiff: percentageDiff.toFixed(3),
          profit: priceDiff
        });
      }
    });

    arbitrageOpportunities.sort((a, b) => b.percentageDiff - a.percentageDiff);

    res.status(200).json({
      prices: groupedPrices,
      arbitrageOpportunities,
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
