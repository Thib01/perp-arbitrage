import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // ✅ SYSTÈME DE FILTRES CORRIGÉ
  const [selectedExchanges, setSelectedExchanges] = useState({
    aster: true,
    hyperliquid: true,
    orderly: true,
    backpack: false,    // désactivés par défaut (pas d'API)
    paradex: false,
    vest: false,
    extended: false,
    hibachi: false,
    pacifica: false
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedExchanges]); // ✅ Refetch quand filtres changent

  // ✅ FONCTION TOGGLE EXCHANGE
  const toggleExchange = (exchange) => {
    setSelectedExchanges(prev => ({
      ...prev,
      [exchange]: !prev[exchange]
    }));
  };

  const calculateSpread = (row) => {
    const prices = [];
    if (selectedExchanges.aster && row.aster !== '-') prices.push(Number(row.aster));
    if (selectedExchanges.hyperliquid && row.hyperliquid !== '-') prices.push(Number(row.hyperliquid));
    if (selectedExchanges.orderly && row.orderly !== '-') prices.push(Number(row.orderly));
    if (selectedExchanges.backpack && row.backpack !== '-') prices.push(Number(row.backpack));
    if (selectedExchanges.paradex && row.paradex !== '-') prices.push(Number(row.paradex));
    if (selectedExchanges.vest && row.vest !== '-') prices.push(Number(row.vest));
    if (selectedExchanges.extended && row.extended !== '-') prices.push(Number(row.extended));
    if (selectedExchanges.hibachi && row.hibachi !== '-') prices.push(Number(row.hibachi));
    if (selectedExchanges.pacifica && row.pacifica !== '-') prices.push(Number(row.pacifica));
    
    if (prices.length < 2) return '-';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return ((max - min) / min * 100).toFixed(2) + '%';
  };

  const fetchData = async () => {
    setLoading(true);
    const results = [];

    // ✅ SEULEMENT ASTER POUR L'INSTANT
    if (selectedExchanges.aster) {
      try {
        const response = await fetch('https://fapi.asterdex.com/fapi/v1/ticker/price');
        const asterData = await response.json();
        
        asterData.slice(0, 20).forEach(item => {
          if (item.symbol && item.price) {
            results.push({
              pair: item.symbol,
              paradex: '-',
              vest: '-',
              extended: '-',
              hyperliquid: '-',
              backpack: '-',
              orderly: '-',
              hibachi: '-',
              aster: parseFloat(item.price).toFixed(4),
              pacifica: '-'
            });
          }
        });
      } catch (error) {
        console.error('Aster API Error:', error);
      }
    }

    setData(results);
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>🚀 Scanner Arbitrage DEX Perpetuals</title>
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        color: '#ffffff', 
        padding: '20px',
        fontFamily: 'Monaco, monospace'
      }}>
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#00ff88', fontSize: '24px', marginBottom: '10px' }}>
            🚀 SCANNER ARBITRAGE DEX PERPETUALS
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Scanner temps réel pour détecter les opportunités d'arbitrage
          </p>
          {lastUpdate && (
            <p style={{ color: '#555', fontSize: '12px' }}>
              Dernière mise à jour: {lastUpdate}
            </p>
          )}
        </div>

        {/* ✅ FILTRES DEX CORRIGÉS */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              backgroundColor: '#1a1a1a', 
              color: '#00ff88', 
              border: '1px solid #333', 
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showFilters ? '✖ Masquer' : '⚙️ Filtrer DEX'} ({Object.values(selectedExchanges).filter(Boolean).length}/9)
          </button>
          
          {showFilters && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {Object.entries(selectedExchanges).map(([exchange, selected]) => (
                  <label key={exchange} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selected}
                      onChange={() => toggleExchange(exchange)}
                      style={{ accentColor: '#00ff88' }}
                    />
                    <span style={{ 
                      color: selected ? '#00ff88' : '#666', 
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {exchange}
                      {['aster', 'hyperliquid', 'orderly'].includes(exchange) && ' ✅'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TABLEAU */}
        <div style={{ overflowX: 'auto', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#2a2a2a' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#00ff88' }}>PAIRE</th>
                {selectedExchanges.paradex && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>PARADEX</th>}
                {selectedExchanges.vest && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>VEST</th>}
                {selectedExchanges.extended && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>EXTENDED</th>}
                {selectedExchanges.hyperliquid && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>HYPERLIQUID</th>}
                {selectedExchanges.backpack && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>BACKPACK</th>}
                {selectedExchanges.orderly && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>ORDERLY</th>}
                {selectedExchanges.hibachi && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>HIBACHI</th>}
                {selectedExchanges.aster && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#00ff88' }}>ASTER ✅</th>}
                {selectedExchanges.pacifica && <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888' }}>PACIFICA</th>}
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#ff6b6b' }}>SPREAD</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#00ff88', fontSize: '11px' }}>{row.pair}</td>
                  {selectedExchanges.paradex && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  {selectedExchanges.vest && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  {selectedExchanges.extended && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  {selectedExchanges.hyperliquid && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  {selectedExchanges.backpack && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  {selectedExchanges.orderly && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  {selectedExchanges.hibachi && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  {selectedExchanges.aster && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#00ff88' }}>{row.aster}</td>}
                  {selectedExchanges.pacifica && <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#666' }}>-</td>}
                  <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#888' }}>{calculateSpread(row)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                    {loading ? '🔄 Chargement des données...' : '❌ Aucune donnée disponible'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
          ⚡ Actualisation automatique toutes les 10 secondes • Filtres DEX actifs: {Object.values(selectedExchanges).filter(Boolean).length}/9
        </div>
      </div>
    </>
  );
}
