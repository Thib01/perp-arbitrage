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
    'Extended': false,
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // 15 secondes
    return () => clearInterval(interval);
  }, []);

  if (loading && prices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            📊 ARBITRAGE SCANNER - PERPÉTUELS
          </h1>
          <div className="text-center text-gray-600">⏳ Chargement des données...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b-4 border-blue-500 rounded-t-lg p-4 mb-0">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            📊 ARBITRAGE SCANNER - PERPÉTUELS
          </h1>
          <div className="text-center text-sm text-gray-600 mt-1">
            ⚡ Détection d'opportunités en temps réel
          </div>
        </div>

        {/* Filtres compacts */}
        <div className="bg-white border-l border-r border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="font-semibold text-gray-700 text-sm">DEX:</span>
            {Object.entries(selectedExchanges).map(([exchange, isSelected]) => (
              <label key={exchange} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleExchangeToggle(exchange)}
                  className="w-3 h-3 text-blue-600"
                />
                <span className={`text-xs px-2 py-1 rounded ${
                  isSelected 
                    ? 'bg-blue-100 text-blue-800 font-medium' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {exchange}
                </span>
              </label>
            ))}
            <div className="ml-4 flex gap-2">
              <button
                onClick={() => setSelectedExchanges(Object.fromEntries(Object.keys(selectedExchanges).map(k => [k, true])))}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedExchanges(Object.fromEntries(Object.keys(selectedExchanges).map(k => [k, false])))}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
              >
                Aucun
              </button>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="bg-white border-l border-r border-gray-200 px-4 py-2 flex justify-between items-center text-sm">
          <div>
            📈 <strong>{filteredPrices.length}</strong> paires actives
          </div>
          <div>
            🔄 DEX sélectionnés: <strong>{Object.values(selectedExchanges).filter(Boolean).length}</strong>
          </div>
          <div className="flex items-center gap-2">
            {loading && <span className="text-orange-600">⏳ Actualisation...</span>}
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* TABLEAU STYLE EXCEL */}
        <div className="bg-white shadow-sm rounded-b-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* En-têtes */}
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-4 py-3 text-left font-bold text-gray-800 border-r border-gray-300">
                    PAIRE
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-gray-800 border-r border-gray-300">
                    PRIX (USD)
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-800 border-r border-gray-300">
                    DEX
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-800">
                    DERNIÈRE MAJ
                  </th>
                </tr>
              </thead>

              {/* Corps du tableau */}
              <tbody>
                {filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 bg-gray-50">
                      {Object.values(selectedExchanges).every(v => !v) 
                        ? "❌ Aucun DEX sélectionné" 
                        : "⚠️ Aucune donnée disponible"}
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((price, index) => (
                    <tr 
                      key={`${price.exchange}-${price.symbol}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      {/* Paire */}
                      <td className="px-4 py-3 border-r border-gray-200">
                        <span className="font-bold text-gray-900 text-sm">
                          {price.symbol}
                        </span>
                      </td>

                      {/* Prix */}
                      <td className="px-4 py-3 text-right border-r border-gray-200">
                        <span className="font-mono text-green-700 font-semibold">
                          ${price.price.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 8 
                          })}
                        </span>
                      </td>

                      {/* DEX */}
                      <td className="px-4 py-3 text-center border-r border-gray-200">
                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                          price.exchange === 'Paradex' ? 'bg-purple-100 text-purple-800' :
                          price.exchange === 'Backpack' ? 'bg-blue-100 text-blue-800' :
                          price.exchange === 'Aster' ? 'bg-orange-100 text-orange-800' :
                          price.exchange === 'Hyperliquid' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {price.exchange}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-600 font-mono">
                          {new Date(price.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500 mt-4">
          🚀 Mise à jour automatique toutes les 15 secondes | 
          💡 Survolez les lignes pour les mettre en évidence
        </div>
      </div>
    </div>
  );
}
