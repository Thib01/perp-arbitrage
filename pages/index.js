import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PriceTable from '../components/PriceTable';
import ArbitrageOpportunities from '../components/ArbitrageOpportunities';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/prices');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1>🚀 Perp Arbitrage Tracker</h1>
            <p className="header-subtitle">
              Détection d'opportunités d'arbitrage en temps réel
            </p>
          </div>
          <div className="controls">
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? '🔄 Actualisation...' : '🔄 Actualiser'}
            </button>
            {lastUpdate && (
              <div className="last-update">
                <span>⏰ Dernière MAJ: {lastUpdate}</span>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {data && (
          <>
            <ArbitrageOpportunities opportunities={data.arbitrageOpportunities} />
            <PriceTable prices={data.prices} />
          </>
        )}

        {loading && !data && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Chargement des données...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { fetchAllPrices } from '../utils/exchanges';

export default function Home() {
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NOUVEAU : État des filtres DEX
  const [selectedExchanges, setSelectedExchanges] = useState({
    'Paradex': true,
    'Backpack': true,
    'Aster': true,
    'Vest': false,      // Désactivé par défaut (API manquante)
    'Extended': false,  // Désactivé par défaut (API manquante)
    'Hyperliquid': false,
    'Orderly': false,
    'Hibachi': false,
    'Pacifica': false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPrices();
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
    setLoading(false);
  };

  // ✅ NOUVEAU : Filtrer les prix selon les DEX sélectionnés
  useEffect(() => {
    const filtered = prices.filter(price => selectedExchanges[price.exchange]);
    setFilteredPrices(filtered);
  }, [prices, selectedExchanges]);

  const handleExchangeToggle = (exchange) => {
    setSelectedExchanges(prev => ({
      ...prev,
      [exchange]: !prev[exchange]
    }));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading price data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-mono mb-8 text-center">
          🏦 PERPÉTUEL DEX ARBITRAGE SCANNER
        </h1>

        {/* ✅ NOUVEAU : Panneau de filtres DEX */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-green-400">
          <h2 className="text-xl font-mono mb-4 text-green-300">📊 Filtres DEX</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {Object.entries(selectedExchanges).map(([exchange, isSelected]) => (
              <label key={exchange} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleExchangeToggle(exchange)}
                  className="w-4 h-4 text-green-400 bg-gray-800 border-gray-600 rounded focus:ring-green-400"
                />
                <span className={`text-sm font-mono ${isSelected ? 'text-green-400' : 'text-gray-500'}`}>
                  {exchange}
                </span>
              </label>
            ))}
          </div>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setSelectedExchanges(Object.fromEntries(Object.keys(selectedExchanges).map(k => [k, true])))}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-black font-mono text-sm"
            >
              Tout sélectionner
            </button>
            <button
              onClick={() => setSelectedExchanges(Object.fromEntries(Object.keys(selectedExchanges).map(k => [k, false])))}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-mono text-sm"
            >
              Tout désélectionner
            </button>
          </div>
        </div>

        {/* Statistiques modifiées pour utiliser filteredPrices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-green-400">
            <h2 className="text-lg font-mono text-green-300 mb-2">Total Markets</h2>
            <p className="text-3xl font-bold">{filteredPrices.length}</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-green-400">
            <h2 className="text-lg font-mono text-green-300 mb-2">Active DEX</h2>
            <p className="text-3xl font-bold">
              {Object.values(selectedExchanges).filter(Boolean).length}
            </p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-green-400">
            <h2 className="text-lg font-mono text-green-300 mb-2">Last Update</h2>
            <p className="text-sm">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Tableau modifié pour utiliser filteredPrices */}
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-green-400">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-green-300">Symbol</th>
                  <th className="px-4 py-3 text-right font-mono text-green-300">Price (USD)</th>
                  <th className="px-4 py-3 text-left font-mono text-green-300">Exchange</th>
                  <th className="px-4 py-3 text-right font-mono text-green-300">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 font-mono">
                      Aucun DEX sélectionné ou aucune donnée disponible
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((price, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-800">
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {price.symbol}
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-green-400">
                        ${price.price.toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 6 
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                          {price.exchange}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-gray-400 text-sm">
                        {new Date(price.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-black font-mono font-bold"
          >
            🔄 Actualiser les prix
          </button>
        </div>
      </div>
    </div>
  );
}
