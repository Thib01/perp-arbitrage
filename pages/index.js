import { useState, useEffect } from 'react';
import { fetchAllPrices } from '../utils/exchanges';

export default function Home() {
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État des filtres DEX
  const [selectedExchanges, setSelectedExchanges] = useState({
    'Paradex': true,
    'Backpack': true,
    'Aster': true,
    'Vest': false,
    'Extended': true,
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

  // Filtrer les prix selon les DEX sélectionnés
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

  // CORRECTION : Intervalle plus long pour éviter les sautillements
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 secondes au lieu de 5
    return () => clearInterval(interval);
  }, []);

  if (loading && prices.length === 0) { // CORRECTION : Afficher loading seulement au premier chargement
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Suivi des opportunités d'arbitrage perpétuels
        </h1>
        <div className="text-center">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Suivi des opportunités d'arbitrage perpétuels
      </h1>

      {/* NOUVEAU : Panneau de filtres DEX */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Filtres DEX</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(selectedExchanges).map(([exchange, isSelected]) => (
            <label key={exchange} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleExchangeToggle(exchange)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${isSelected ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                {exchange}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setSelectedExchanges(Object.fromEntries(Object.keys(selectedExchanges).map(k => [k, true])))}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            Tout sélectionner
          </button>
          <button
            onClick={() => setSelectedExchanges(Object.fromEntries(Object.keys(selectedExchanges).map(k => [k, false])))}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
          >
            Tout désélectionner
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6 border">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Markets</h2>
          <p className="text-3xl font-bold text-blue-600">{filteredPrices.length}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 border">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Active DEX</h2>
          <p className="text-3xl font-bold text-green-600">
            {Object.values(selectedExchanges).filter(Boolean).length}
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 border">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            {loading ? "🔄 Mise à jour..." : "Dernière maj"}
          </h2>
          <p className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Tableau des prix */}
      <div className="bg-white shadow overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (USD)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exchange
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    {Object.values(selectedExchanges).every(v => !v) 
                      ? "Aucun DEX sélectionné" 
                      : "Aucune donnée disponible pour les DEX sélectionnés"}
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price, index) => (
                  <tr key={`${price.exchange}-${price.symbol}-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {price.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${price.price.toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 6 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {price.exchange}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {new Date(price.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={fetchData}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium ${
            loading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? '🔄 Actualisation...' : '🔄 Actualiser les prix'}
        </button>
      </div>
    </div>
  );
}
