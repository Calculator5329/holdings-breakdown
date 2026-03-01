import { useState, useEffect } from 'react';
import {
  processHoldings,
  CSV_FILES,
  OUTPUT_FILES,
  HoldingCategory,
} from './services/holdings';
import type { AggregatedHolding } from './services/holdings';
import { getCategoryDisplayName } from './services/holdings/categories';
import './App.css';

interface ProcessedData {
  holdings: AggregatedHolding[];
  summary: {
    totalValue: number;
    byCategory: Record<HoldingCategory, { value: number; percentage: number }>;
  };
  csvOutputs: {
    master: string;
    stocks: string;
    bonds: string;
    cash: string;
    marketFunds: string;
    leveraged: string;
    summary: string;
  };
}

function App() {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndProcess() {
      try {
        setLoading(true);
        setError(null);

        // Load all CSV files from public folder
        const files: Array<{ content: string; filename: string }> = [];

        for (const filename of CSV_FILES) {
          try {
            const response = await fetch(`/${filename}`);
            if (response.ok) {
              const content = await response.text();
              files.push({ content, filename });
            }
          } catch {
            console.warn(`Could not load ${filename}`);
          }
        }

        if (files.length === 0) {
          throw new Error('No CSV files found in public folder');
        }

        // Process the holdings
        const result = processHoldings(files);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process holdings');
      } finally {
        setLoading(false);
      }
    }

    loadAndProcess();
  }, []);

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="app">
        <h1>Holdings Breakdown</h1>
        <p>Loading and processing CSV files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <h1>Holdings Breakdown</h1>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <h1>Holdings Breakdown</h1>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Holdings Breakdown</h1>

      {/* Summary Section */}
      <section className="summary">
        <h2>Portfolio Summary</h2>
        <div className="total">
          <span>Total Portfolio Value:</span>
          <strong>{formatCurrency(data.summary.totalValue)}</strong>
        </div>

        <div className="category-grid">
          {Object.values(HoldingCategory).map((category) => {
            const categoryData = data.summary.byCategory[category];
            return (
              <div key={category} className="category-card">
                <h3>{getCategoryDisplayName(category)}</h3>
                <div className="value">{formatCurrency(categoryData.value)}</div>
                <div className="percentage">{categoryData.percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Download Section */}
      <section className="downloads">
        <h2>Download CSV Files</h2>
        <div className="button-grid">
          <button onClick={() => downloadCSV(data.csvOutputs.master, OUTPUT_FILES.master)}>
            Master CSV
          </button>
          <button onClick={() => downloadCSV(data.csvOutputs.stocks, OUTPUT_FILES.stocks)}>
            Stocks CSV
          </button>
          <button onClick={() => downloadCSV(data.csvOutputs.bonds, OUTPUT_FILES.bonds)}>
            Bonds CSV
          </button>
          <button onClick={() => downloadCSV(data.csvOutputs.cash, OUTPUT_FILES.cash)}>
            Cash CSV
          </button>
          <button onClick={() => downloadCSV(data.csvOutputs.marketFunds, OUTPUT_FILES.marketFunds)}>
            Market Funds CSV
          </button>
          <button onClick={() => downloadCSV(data.csvOutputs.leveraged, OUTPUT_FILES.leveraged)}>
            Leveraged CSV
          </button>
          <button onClick={() => downloadCSV(data.csvOutputs.summary, OUTPUT_FILES.summary)}>
            Summary CSV
          </button>
        </div>
      </section>

      {/* Holdings Table */}
      <section className="holdings">
        <h2>All Holdings ({data.holdings.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Value</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {data.holdings.map((holding) => (
              <tr key={holding.symbol}>
                <td className="symbol">{holding.symbol}</td>
                <td className="name">{holding.name}</td>
                <td className="value">{formatCurrency(holding.totalValue)}</td>
                <td className="category">{getCategoryDisplayName(holding.category)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
