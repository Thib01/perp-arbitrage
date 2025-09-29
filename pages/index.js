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
