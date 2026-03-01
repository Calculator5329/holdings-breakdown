# Holdings Breakdown - Roadmap

## Current Features

### v1.0 - CSV Aggregation Service (Completed)

- [x] Parse Robinhood-format CSV files (Holdings-*.csv)
- [x] Parse Fidelity-format CSV files (Portfolio_Positions-*.csv, positions*.csv)
- [x] Aggregate holdings by ticker symbol across all accounts
- [x] Categorize holdings into: Cash, Bonds, Stocks, Market Funds, Leveraged
- [x] Generate master CSV with all holdings
- [x] Generate category-specific CSVs with weights
- [x] Generate summary CSV with totals by category

## Planned Features

### v1.1 - UI Dashboard

- [ ] Visual dashboard showing portfolio breakdown
- [ ] Pie charts for category allocation
- [ ] Sortable/filterable holdings table
- [ ] Drag-and-drop CSV upload

### v1.2 - Enhanced Analytics

- [ ] Historical tracking (import multiple date snapshots)
- [ ] Performance metrics (gain/loss by category)
- [ ] Concentration risk alerts
- [ ] Sector breakdown for stocks

### v1.3 - Export & Sharing

- [ ] Export to PDF reports
- [ ] Export to Excel with formatting
- [ ] Shareable read-only links

## Technical Debt

- [ ] Add unit tests for CSV parsing
- [ ] Add integration tests for full pipeline
- [ ] Handle edge cases: foreign stocks, options, crypto
