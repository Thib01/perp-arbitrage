import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const exchanges = [
    { name: 'Aster', url: 'https://fapi.asterdex.com/fapi/v1/ticker/price', working: true },
    { name: 'Backpack', url: 'https://api.backpack.exchange/api/v1/tickers', working: true },
    { name: 'Paradex', url: 'https://api.prod.paradex.trade/v1/markets', working: true },
    { name: 'dYdX', url: '', working: false },
    { name: 'Hyperliquid', url: '', working: false },
    { name: 'Drift', url: '', working: false },
    { name: 'Jupiter Perp', url: '', working: false },
    { name: 'Apex Pro', url: '', working: false },
    { name: 'Orderly', url: '', working: false }
  ];

  const fetchData = async () => {
    setLoading(true);
    const results = [];

    // Fetch Aster data
    try {
      const asterResponse = await fetch('https://fapi.asterdex.com/fapi/v1/ticker/price');
      const asterData = await asterResponse.json();
      asterData.forEach(item => {
        if (item.symbol && item.price) {
          results.push({
            pair: item.symbol,
            aster: parseFloat(item.price).toFixed(4),
            backpack: '-',
            paradex: '-',
            dydx: '-',
            hyperliquid: '-',
            drift: '-',
            jupiter: '-',
            apex: '-',
            orderly: '-'
          });
        }
      });
    } catch (error) {
      console.error('Aster API Error:', error);
    }

    // Fetch Backpack data
    try {
      const backpackResponse = await fetch('https://api.backpack.exchange/api/v1/tickers');
      const backpackData = await backpackResponse.json();
      Object.keys(backpackData).forEach(symbol => {
        const existingIndex = results.findIndex(r => r.pair === symbol);
        const price = parseFloat(backpackData[symbol].lastPrice).toFixed(4);
        
        if (existingIndex >= 0) {
          results[existingIndex].backpack = price;
        } else {
          results.push({
            pair: symbol,
            aster: '-',
            backpack: price,
            paradex: '-',
            dydx: '-',
            hyperliquid: '-',
            drift: '-',
            jupiter: '-',
            apex: '-',
            orderly: '-'
          });
        }
      });
    } catch (error) {
      console.error('Backpack API Error:', error);
    }

    // Fetch Paradex data
    try {
      const paradexResponse = await fetch('https://api.prod.paradex.trade/v1/markets');
      const paradexData = await paradexResponse.json();
      paradexData.results?.forEach(item => {
        const existingIndex = results.findIndex(r => r.pair === item.symbol);
        const price = parseFloat(item.oracle_price_usd || item.mark_price || 0).toFixed(4);
        
        if (existingIndex >= 0) {
          results[existingIndex].paradex = price;
        } else {
          results.push({
            pair: item.symbol,
            aster: '-',
            backpack: '-',
            paradex: price,
            dydx: '-',
            hyperliquid: '-',
            drift: '-',
            jupiter: '-',
            apex: '-',
            orderly: '-'
          });
        }
      });
    } catch (error) {
      console.error('Paradex API Error:', error);
    }

    setData(results);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const calculateSpread = (row) => {
    const prices = [row.aster, row.backpack, row.paradex]
      .filter(p => p !== '-')
      .map(p => parseFloat(p))
      .filter(p => !isNaN(p));
    
    if (prices.length < 2) return '-';
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const spread = ((max - min) / min * 100).toFixed(2);
    
    return spread + '%';
  };

  return (
    <>
      <Head>
        <title>Arbitrage Scanner - Perpetuels</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        fontFamily: 'monospace',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        minHeight: '100vh',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #333',
          paddingBottom: '15px'
        }}>
          <h1 style={{ margin: 0, color: '#00ff88' }}>
            🔍 ARBITRAGE SCANNER - PERPETUELS
          </h1>
          <div>
            <button 
              onClick={fetchData}
              disabled={loading}
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              {loading ? '🔄 Chargement...' : '🔄 Actualiser'}
            </button>
            <span style={{ fontSize: '12px', color: '#888' }}>
              Dernière MAJ: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Status des APIs */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#00ff88', marginBottom: '10px' }}>📊 Status des APIs:</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {exchanges.map(exchange => (
              <span key={exchange.name} style={{
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '12px',
                backgroundColor: exchange.working ? '#004d00' : '#4d0000',
                color: exchange.working ? '#00ff88' : '#ff4444'
              }}>
                {exchange.working ? '✅' : '❌'} {exchange.name}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#333' }}>
                <th style={headerStyle}>PAIRE</th>
                <th style={headerStyle}>ASTER</th>
                <th style={headerStyle}>BACKPACK</th>
                <th style={headerStyle}>PARADEX</th>
                <th style={headerStyle}>dYdX</th>
                <th style={headerStyle}>HYPERLIQUID</th>
                <th style={headerStyle}>DRIFT</th>
                <th style={headerStyle}>JUPITER</th>
                <th style={headerStyle}>APEX PRO</th>
                <th style={headerStyle}>ORDERLY</th>
                <th style={headerStyle}>SPREAD MAX</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((row, index) => (
                <tr key={index} style={{
                  backgroundColor: index % 2 === 0 ? '#2a2a2a' : '#333',
                  borderBottom: '1px solid #444'
                }}>
                  <td style={cellStyle}><strong>{row.pair}</strong></td>
                  <td style={cellStyle}>{row.aster}</td>
                  <td style={cellStyle}>{row.backpack}</td>
                  <td style={cellStyle}>{row.paradex}</td>
                  <td style={cellStyle}>-</td>
                  <td style={cellStyle}>-</td>
                  <td style={cellStyle}>-</td>
                  <td style={cellStyle}>-</td>
                  <td style={cellStyle}>-</td>
                  <td style={cellStyle}>-</td>
                  <td style={{...cellStyle, color: '#00ff88', fontWeight: 'bold'}}>
                    {calculateSpread(row)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={{...cellStyle, textAlign: 'center', color: '#888'}}>
                    {loading ? '🔄 Chargement des données...' : '❌ Aucune donnée disponible'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          color: '#888', 
          fontSize: '12px' 
        }}>
          ⚡ Actualisation automatique toutes les 10 secondes • 
          🎯 Scanner d'arbitrage en temps réel
        </div>
      </div>
    </>
  );
}

const headerStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  borderRight: '1px solid #555',
  color: '#00ff88',
  fontSize: '12px',
  fontWeight: 'bold'
};

const cellStyle = {
  padding: '8px',
  borderRight: '1px solid #555',
  fontSize: '11px',
  color: '#ffffff'
};
