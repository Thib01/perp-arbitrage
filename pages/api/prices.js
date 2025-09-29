export default async function handler(req, res) {
  try {
    const exchanges = [
      'hyperliquid',
      'orderly', 
      'backpack',
      'paradex',
      'vest',
      'extended',
      'hibachi',
      'aster',
      'pacifica'
    ];

    // Récupération en parallèle avec timeout
    const pricePromises = exchanges.map(async (exchange) => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const dataPromise = exchangeAdapters[exchange] 
          ? exchangeAdapters[exchange]()
          : exchangeAdapters.generic(exchange);
          
        return await Promise.race([dataPromise, timeoutPromise]);
      } catch (error) {
        console.error(`Error fetching ${exchange}:`, error);
        return [];
      }
    });

    const allPrices = await Promise.all(pricePromises);
    // ... reste du code
  }
}
