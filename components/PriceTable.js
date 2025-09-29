import { useState } from 'react';

export default function PriceTable({ prices }) {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  
  if (!prices) return null;
  
  const symbols = Object.keys(prices).sort();
  const filteredSymbols = selectedSymbol 
    ? [selectedSymbol] 
    : symbols;

  return (
    <div className="price-table-section">
      <h2>💰 Comparaison des Prix</h2>
      
      <div className="filter-controls">
        <select 
          value={selectedSymbol} 
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="symbol-select"
        >
          <option value="">📈 Toutes les paires</option>
          {symbols.map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        {filteredSymbols.map(symbol => {
          const symbolPrices = prices[symbol] || [];
          const minPrice = Math.min(...symbolPrices.map(p => p.price));
          const maxPrice = Math.max(...symbolPrices.map(p => p.price));
          const spread = ((maxPrice - minPrice) / minPrice * 100);

          return (
            <div key={symbol} className="price-group">
              <div className="price-group-header">
                <h3>{symbol}</h3>
                {spread > 0.1 && (
                  <span className="spread-badge">
                    Écart: {spread.toFixed(2)}%
                  </span>
                )}
              </div>
              <div className="price-cards">
                {symbolPrices.map((price, index) => (
                  <div 
                    key={`${symbol}-${price.exchange}`}
                    className={`price-card ${
                      price.price === minPrice ? 'lowest-price' : 
                      price.price === maxPrice ? 'highest-price' : ''
                    }`}
                  >
                    <div className="exchange-name">{price.exchange}</div>
                    <div className="price-value">${price.price.toFixed(2)}</div>
                    {price.price === minPrice && <span className="badge lowest">Plus bas</span>}
                    {price.price === maxPrice && <span className="badge highest">Plus haut</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
