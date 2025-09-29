export default function ArbitrageOpportunities({ opportunities }) {
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="opportunities-section">
        <h2>📊 Opportunités d'Arbitrage</h2>
        <p className="no-opportunities">Aucune opportunité détectée actuellement</p>
      </div>
    );
  }

  return (
    <div className="opportunities-section">
      <h2>📊 Meilleures Opportunités d'Arbitrage</h2>
      <div className="opportunities-grid">
        {opportunities.slice(0, 6).map((opp, index) => (
          <div key={index} className="opportunity-card">
            <div className="opp-header">
              <span className="symbol">{opp.symbol}</span>
              <span className={`percentage ${parseFloat(opp.percentageDiff) > 1 ? 'high' : 'medium'}`}>
                +{opp.percentageDiff}%
              </span>
            </div>
            <div className="opp-details">
              <div className="trade-row">
                <div className="buy-info">
                  <span className="label">💰 Acheter sur:</span>
                  <span className="exchange">{opp.buyExchange}</span>
                  <span className="price">${opp.buyPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="trade-row">
                <div className="sell-info">
                  <span className="label">💸 Vendre sur:</span>
                  <span className="exchange">{opp.sellExchange}</span>
                  <span className="price">${opp.sellPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="profit-info">
                <span className="profit">🎯 Profit: ${opp.profit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
