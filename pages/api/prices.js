// pages/api/prices.js
import { exchangeAdapters } from '../../utils/exchanges.js';

export default async function handler(req, res) {
  console.log('=== API PRICES CALLED ===');
  
  try {
    const startTime = Date.now();
    
    // Liste des échanges avec APIs réelles et simulées
// pages/api/prices.js
const exchanges = [
  'paradex',
  'vest',
  'extended',
  'hyperliquid',
  'backpack',
  'orderly',
  'hibachi',
  'aster',
  'pacifica'
];



    console.log('Fetching data from exchanges:', exchanges);

    // Récupération en parallèle avec timeout de 5 secondes
    const pricePromises = exchanges.map(async (exchange) => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${exchange} timeout`)), 5000)
        );
        
        const dataPromise = exchangeAdapters[exchange] 
          ? exchangeAdapters[exchange]()
          : exchangeAdapters.generic(exchange);
          
        return await Promise.race([dataPromise, timeoutPromise]);
      } catch (error) {
        console.error(`Error fetching ${exchange}:`, error.message);
        return [];
      }
    });

    const allPricesArrays = await Promise.all(pricePromises);
    console.log('Raw data received:', allPricesArrays.map(arr => arr.length));
    
    // Aplatir toutes les données
    const allPrices = allPricesArrays.flat().filter(price => price && price.price > 0);
    console.log('Total valid prices:', allPrices.length);

    // Grouper par paire pour calculer les opportunités d'arbitrage
    const pricesBySymbol = {};
    allPrices.forEach(price => {
      if (!pricesBySymbol[price.symbol]) {
        pricesBySymbol[price.symbol] = [];
      }
      pricesBySymbol[price.symbol].push(price);
    });

    // Calculer les opportunités d'arbitrage
    const opportunities = [];
    Object.entries(pricesBySymbol).forEach(([symbol, prices]) => {
      if (prices.length >= 2) {
        prices.sort((a, b) => a.price - b.price);
        const lowest = prices[0];
        const highest = prices[prices.length - 1];
        
        const spread = ((highest.price - lowest.price) / lowest.price) * 100;
        
        if (spread > 0.01) { // Plus de 0.01% de spread
          opportunities.push({
            symbol,
            buyExchange: lowest.exchange,
            sellExchange: highest.exchange,
            buyPrice: lowest.price,
            sellPrice: highest.price,
            spread: spread,
            profit: spread,
            timestamp: Date.now()
          });
        }
      }
    });

    // Trier par spread décroissant
    opportunities.sort((a, b) => b.spread - a.spread);

    const processingTime = Date.now() - startTime;
    console.log(`Processing completed in ${processingTime}ms`);
    console.log(`Found ${opportunities.length} arbitrage opportunities`);

    // Réponse avec données réelles
    res.status(200).json({
      success: true,
      data: opportunities.slice(0, 20), // Top 20 opportunités
      metadata: {
        totalOpportunities: opportunities.length,
        totalPrices: allPrices.length,
        exchanges: exchanges.length,
        processingTime,
        timestamp: Date.now(),
        dataSource: 'real-apis'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
}
