# Holdings Breakdown - Architecture

## Overview

This application aggregates portfolio holdings from multiple CSV exports (Robinhood, Fidelity, etc.) into a unified view with category breakdowns.

## Three-Layer Architecture

```
UI Layer → Store Layer → Service Layer
```

| Layer   | Location              | Purpose                              |
| ------- | --------------------- | ------------------------------------ |
| UI      | `src/components/`     | React components, presentation only  |
| Store   | `src/stores/`         | MobX stores, state management        |
| Service | `src/services/`       | Business logic, data processing      |

## Service Layer: Holdings Service

Located in `src/services/holdings/`

### Module Structure

```
holdings/
├── index.ts        # Main exports and orchestrator
├── types.ts        # TypeScript interfaces and enums
├── csvParser.ts    # CSV parsing for multiple formats
├── categories.ts   # Ticker categorization logic
├── aggregator.ts   # Holdings aggregation and grouping
└── csvWriter.ts    # CSV output generation
```

### Data Flow

```
Input CSVs → Parser → Raw Holdings → Aggregator → Categorized Holdings → Writer → Output CSVs
```

1. **Parser** (`csvParser.ts`)
   - Detects CSV format (Robinhood vs Fidelity)
   - Extracts symbol, name, quantity, value
   - Skips disclaimer text and invalid rows

2. **Aggregator** (`aggregator.ts`)
   - Normalizes symbols (removes `**` suffixes)
   - Sums values for same ticker across accounts
   - Groups holdings by category
   - Calculates weights within categories

3. **Categorizer** (`categories.ts`)
   - Maintains lookup tables for each category
   - Handles special cases (CDs, money market)
   - Defaults unknown symbols to Stocks

4. **Writer** (`csvWriter.ts`)
   - Generates properly escaped CSV strings
   - Formats currency and percentage values

### Category Definitions

| Category     | Description                          | Examples                    |
| ------------ | ------------------------------------ | --------------------------- |
| Cash         | Money market, stable value           | SPAXX, TIAA Traditional     |
| Bonds        | Bond ETFs, funds, CDs                | BLV, BND, AGG, CDs          |
| Stocks       | Individual company stocks            | META, GOOGL, AMZN           |
| Market Funds | Index funds, broad market ETFs       | VTI, FSKAX, SPY, QQQ        |
| Leveraged    | 2x and 3x leveraged ETFs             | TQQQ, SPXL, SOXL            |

## Output Files

| File             | Contents                                    |
| ---------------- | ------------------------------------------- |
| `master.csv`     | All holdings with Symbol, Name, Value, Category |
| `stocks.csv`     | Stocks only with weight percentages         |
| `bonds.csv`      | Bonds only with weight percentages          |
| `cash.csv`       | Cash only with weight percentages           |
| `market_funds.csv` | Market funds only with weight percentages |
| `leveraged.csv`  | Leveraged ETFs only with weight percentages |
| `summary.csv`    | Category totals and percentages             |

## Extending Categories

To add new tickers to categories, edit `src/services/holdings/categories.ts`:

```typescript
// Add to the appropriate Set
const MARKET_FUND_SYMBOLS = new Set([
  'FSKAX',
  'VTI',
  'NEW_TICKER', // Add new symbol here
]);
```

## Future Considerations

- **Store Layer**: Will use MobX for reactive state management
- **Persistence**: Consider IndexedDB for caching parsed holdings
- **Validation**: Add schema validation for CSV imports
