// pages/api/prices.js - NOUVELLE VERSION CORRIGÉE

export default async function handler(req, res) {
  const { exchanges } = req.query;
  const selectedExchanges = exchanges ? exchanges.split(',') : [];
  
  console.log('🎯 API appelée avec:', selectedExchanges);

  try {
    // 🎯 NOUVEAU SYSTÈME DE STOCKAGE PAR PAIRE
    const allPairsData = new Map(); // Map<paireName, {aster: price, hyperliquid: price, ...}>
    const results = [];

    // ✅ COLLECTE PARALLÈLE DE TOUS LES DEX
    const promises = [];

    if (selectedExchanges.includes('aster')) {
      promises.push(
        fetch('https://fapi.asterdex.com/fapi/v1/ticker/price')
          .then(res => res.json())
          .then(data => {
            console.log('📡 Fetching Aster...');
            if (data && Array.isArray(data)) {
              console.log(`✅ Aster: ${data.length} paires`);
              data.forEach(item => {
                if (item.symbol && item.price) {
                  if (!allPairsData.has(item.symbol)) {
                    allPairsData.set(item.symbol, {});
                  }
                  allPairsData.get(item.symbol).aster = parseFloat(item.price).toFixed(6);
                }
              });
            }
          })
          .catch(err => console.error('❌ Aster error:', err))
      );
    }

    if (selectedExchanges.includes('hyperliquid')) {
      promises.push(
        fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'allMids' })
        })
          .then(res => res.json())
          .then(data => {
            console.log('📡 Fetching Hyperliquid...');
            if (data && typeof data === 'object') {
              const pairs = Object.entries(data);
              console.log(`✅ Hyperliquid: ${pairs.length} paires`);
              pairs.forEach(([symbol, price]) => {
                if (symbol && price && parseFloat(price) > 0) {
                  if (!allPairsData.has(symbol)) {
                    allPairsData.set(symbol, {});
                  }
                  allPairsData.get(symbol).hyperliquid = parseFloat(price).toFixed(6);
                }
              });
            }
          })
          .catch(err => console.error('❌ Hyperliquid error:', err))
      );
    }

    if (selectedExchanges.includes('backpack')) {
      promises.push(
        fetch('https://api.backpack.exchange/api/v1/tickers')
          .then(res => res.json())
          .then(data => {
            console.log('📡 Fetching Backpack...');
            if (data && Array.isArray(data)) {
              console.log(`✅ Backpack: ${data.length} paires`);
              data.forEach(item => {
                if (item.symbol && item.lastPrice) {
                  if (!allPairsData.has(item.symbol)) {
                    allPairsData.set(item.symbol, {});
                  }
                  allPairsData.get(item.symbol).backpack = parseFloat(item.lastPrice).toFixed(6);
                }
              });
            }
          })
          .catch(err => console.error('❌ Backpack error:', err))
      );
    }

    if (selectedExchanges.includes('orderly')) {
      promises.push(
        fetch('https://api-evm.orderly.org/v1/public/futures')
          .then(res => res.json())
          .then(data => {
            console.log('📡 Fetching Orderly...');
            if (data?.data?.rows && Array.isArray(data.data.rows)) {
              console.log(`✅ Orderly: ${data.data.rows.length} paires`);
              data.data.rows.forEach(item => {
                if (item.symbol && item.mark_price) {
                  if (!allPairsData.has(item.symbol)) {
                    allPairsData.set(item.symbol, {});
                  }
                  allPairsData.get(item.symbol).orderly = parseFloat(item.mark_price).toFixed(6);
                }
              });
            }
          })
          .catch(err => console.error('❌ Orderly error:', err))
      );
    }

    // ⏳ ATTENDRE TOUTES LES REQUÊTES
    await Promise.all(promises);

    // 🎯 FUSION FINALE : TOUTES LES PAIRES AVEC LEURS PRIX
    for (const [pairName, prices] of allPairsData.entries()) {
      const row = { pair: pairName };
      
      // Ajouter tous les exchanges sélectionnés
      selectedExchanges.forEach(exchange => {
        row[exchange] = prices[exchange] || '-';
      });

      results.push(row);
    }

    // 📊 STATS FINALES
    console.log('📊 Résultats par exchange:', selectedExchanges.map(ex => 
      `${ex}: ${Array.from(allPairsData.values()).filter(p => p[ex]).length}`
    ));
    
    console.log(`✅ API retourne: ${results.length} paires fusionnées`);
    console.log('📋 Exemple de fusion:', results[0]);

    res.status(200).json(results);

  } catch (error) {
    console.error('❌ Erreur API:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
