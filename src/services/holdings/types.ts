/**
 * Category types for holdings classification
 */
export const HoldingCategory = {
  CASH: 'cash',
  BONDS: 'bonds',
  STOCKS: 'stocks',
  MARKET_FUNDS: 'market_funds',
  LEVERAGED: 'leveraged',
} as const;

export type HoldingCategory = (typeof HoldingCategory)[keyof typeof HoldingCategory];

/**
 * Raw holding data parsed from CSV
 */
export interface RawHolding {
  symbol: string;
  name: string;
  quantity: number;
  value: number;
  source: string; // filename it came from
}

/**
 * Aggregated holding with category
 */
export interface AggregatedHolding {
  symbol: string;
  name: string;
  totalValue: number;
  category: HoldingCategory;
}

/**
 * Holding with weight calculation for category CSVs
 */
export interface WeightedHolding extends AggregatedHolding {
  weight: number; // percentage of category total
}

/**
 * CSV format types
 */
export type CsvFormat = 'robinhood' | 'fidelity';

/**
 * Parser result from a single file
 */
export interface ParseResult {
  holdings: RawHolding[];
  format: CsvFormat;
  filename: string;
}

/**
 * Output file configuration
 */
export interface OutputConfig {
  masterPath: string;
  categoryPaths: Record<HoldingCategory, string>;
}
