// pages/index.js - VERSION FINALE PROPRE
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [selectedExchanges, setSelectedExchanges] = useState({
    aster: true,
    hyperliquid: true,
    orderly: true,
    backpack: true,
    paradex: false,
    vest: false,
    extended: false,
    hibachi: false,
    pacifica: false
  });

  const exchanges = {
    aster: { name: 'Aster', logo: '🚀', status: '✅', color: '#00ff88' },
    hyperliquid: { name: 'Hyperliquid', logo: '💧', status: '✅', color: '#00ff88' },
    orderly: { name: 'Orderly', logo: '📊', status: '✅', color: '#00ff88' },
    backpack: { name: 'Backpack', logo: '🎒', status: '✅', color: '#00ff88' },
    paradex: { name: 'Paradex', logo: '🏛️', status: '⚠️', color: '#ffaa00' },
    vest: { name: 'Vest', logo: '👔', status: '❌', color: '#ff6b6b' },
    extended: { name: 'Extended', logo: '📈', status: '❌', color: '#ff6b6b' },
    hibachi: { name: 'Hibachi', logo: '🔥', status: '❌', color: '#ff6b6b' },
    pacifica: { name: 'Pacifica', logo: '🌊', status: '❌', color: '#ff6b6b' }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [mounted, selectedExchanges]);

  // 🎯 CALCUL CORRECT DES EXCHANGES ACTIFS
  const activeExchanges = Object.entries(selectedExchanges)
    .filter(([exchange, selected]) => selected)
    .map(([exchange]) => exchange);

  const fetchData = async () => {
    if (activeExchanges.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/prices?exchanges=${activeExchanges.join(',')}`);
      const result = await response.json();

      console.log('🔍 FULL DEBUG:');
      console.log('📊 selectedExchanges:', selectedExchanges);
      console.log('📊 activeExchanges:', activeExchanges);
      console.log('📊 result length:', result.length);
      console.log('📊 result[0]:', result[0]);
      console.log('📊 Object.keys(result[0]):', Object.keys(result[0] || {}));
      console.log('🔍 FULL DEBUG:');
console.log('📊 selectedExchanges:', selectedExchanges);
console.log('📊 activeExchanges:', activeExchanges);
console.log('📊 result length:', result.length);
console.log('📊 result[0]:', result[0]);
console.log('📊 Object.keys(result[0]):', Object.keys(result[0] || {}));

      activeExchanges.forEach(exchange => {
        console.log(`🎯 ${exchange} dans result[0]:`, result[0]?.[exchange]);
      });

      setData(result);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Erreur lors du fetch:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSpread = (row) => {
    const prices = activeExchanges
      .map(exchange => row[exchange])
      .filter(price => price !== '-' && price !== undefined && price !== null)
      .map(price => parseFloat(price))
      .filter(price => !isNaN(price) && price > 0);

    if (prices.length < 2) return '-';

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const spread = ((max - min) / min * 100);
    
    return spread > 0.01 ? `${spread.toFixed(2)}%` : '<0.01%';
  };

  const toggleExchange = (exchangeKey) => {
    setSelectedExchanges(prev => ({
      ...prev,
      [exchangeKey]: !prev[exchangeKey]
    }));
  };

  if (!mounted) {
    return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>Chargement...</div>;
  }

  return (
    <>
      <Head>
        <title>DEX Price Monitor 🚀</title>
        <meta name="description" content="Monitoring des prix sur les DEX" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', 
        minHeight: '100vh', 
        padding: '20px',
        fontFamily: 'monospace'
      }}>
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#00ff88', fontSize: '2.5em', margin: '0', textShadow: '0 0 20px #00ff88' }}>
            🚀 DEX PRICE MONITOR
          </h1>
          <p style={{ color: '#888', marginTop: '10px' }}>
            {loading ? '⏳ Chargement...' : `✅ Dernière MAJ: ${lastUpdate || 'Jamais'}`}
          </p>
        </div>

        {/* SÉLECTEURS D'EXCHANGES */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px',
          maxWidth: '1200px',
          margin: '0 auto 30px auto'
        }}>
          {Object.entries(exchanges).map(([key, exchange]) => (
            <button
              key={key}
              onClick={() => toggleExchange(key)}
              style={{
                padding: '12px 20px',
                backgroundColor: selectedExchanges[key] ? exchange.color : '#2a2a2a',
                color: selectedExchanges[key] ? '#000' : '#fff',
                border: `2px solid ${exchange.color}`,
                borderRadius: '8px',
                cursor: exchange.status === '❌' ? 'not-allowed' : 'pointer',
                opacity: exchange.status === '❌' ? 0.5 : 1,
                transition: 'all 0.3s ease',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              disabled={exchange.status === '❌'}
            >
              <span>{exchange.logo} {exchange.name}</span>
              <span style={{ fontSize: '0.8em' }}>{exchange.status}</span>
            </button>
          ))}
        </div>

        {/* DEBUG MODE - REMPLACEZ LE TABLEAU PAR CECI TEMPORAIREMENT */}
        <div style={{ overflowX: 'auto', backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ color: '#00ff88', marginBottom: '20px' }}>🔍 DEBUG MODE</h2>
          
          <div style={{ color: '#fff', marginBottom: '20px' }}>
            <p><strong>selectedExchanges:</strong> {JSON.stringify(selectedExchanges)}</p>
            <p><strong>activeExchanges:</strong> {JSON.stringify(activeExchanges)}</p>
            <p><strong>data.length:</strong> {data.length}</p>
            <p><strong>loading:</strong> {loading.toString()}</p>
          </div>

          {data.length > 0 && (
            <div style={{ color: '#fff' }}>
              <h3>Premier élément des données :</h3>
              <pre style={{ backgroundColor: '#000', padding: '10px', overflow: 'auto' }}>
                {JSON.stringify(data[0], null, 2)}
              </pre>
              
              <h3>Colonnes détectées :</h3>
              <p>{Object.keys(data[0]).join(', ')}</p>
              
              <h3>Test des valeurs :</h3>
              {activeExchanges.map(exchange => (
                <p key={exchange}>{exchange}: {data[0][exchange] || 'UNDEFINED'}</p>
              ))}
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', border: '1px solid #333', color: '#00ff88' }}>Paire</th>
                {activeExchanges.map(exchange => (
                  <th key={exchange} style={{ padding: '10px', border: '1px solid #333', color: '#fff' }}>
                    {exchange}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #333', color: '#00ff88' }}>
                    {row.pair}
                  </td>
                  {activeExchanges.map(exchange => (
                    <td key={exchange} style={{ padding: '10px', border: '1px solid #333', color: '#fff' }}>
                      {row[exchange] || 'NULL'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
