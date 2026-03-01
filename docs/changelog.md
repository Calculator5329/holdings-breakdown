# Holdings Breakdown - Changelog

## [1.0.0] - 2026-01-31

### Added

- Initial holdings aggregation service
- CSV parser supporting Robinhood and Fidelity export formats
- Ticker categorization system (Cash, Bonds, Stocks, Market Funds, Leveraged)
- Holdings aggregator that sums values by ticker across all accounts
- CSV writer generating master and category-specific output files
- Summary statistics with category totals and percentages

### Files Created

- `src/services/holdings/types.ts` - TypeScript interfaces and enums
- `src/services/holdings/csvParser.ts` - Multi-format CSV parser
- `src/services/holdings/categories.ts` - Ticker categorization logic
- `src/services/holdings/aggregator.ts` - Holdings aggregation
- `src/services/holdings/csvWriter.ts` - Output CSV generation
- `src/services/holdings/index.ts` - Service orchestrator and exports

### Input Files Supported

- `Holdings-*.csv` (Robinhood format)
- `Portfolio_Positions-*.csv` (Fidelity 401K/403B format)
- `positions*.csv` (Fidelity brokerage format)

### Output Files Generated

- `master.csv` - All holdings aggregated
- `stocks.csv` - Individual stocks with weights
- `bonds.csv` - Bonds and CDs with weights
- `cash.csv` - Money market holdings
- `market_funds.csv` - Index funds and ETFs
- `leveraged.csv` - Leveraged ETFs with weights
- `summary.csv` - Category totals and percentages
