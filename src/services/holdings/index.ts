/**
 * Holdings Aggregation Service
 *
 * This service parses CSV files from various brokerages,
 * aggregates holdings by ticker symbol, categorizes them,
 * and generates output CSVs.
 */

export { HoldingCategory } from './types';
export type {
  RawHolding,
  AggregatedHolding,
  WeightedHolding,
  ParseResult,
} from './types';

export { parseCSV, parseMultipleCSVs } from './csvParser';
export { normalizeSymbol, categorizeSymbol, getCategoryDisplayName } from './categories';
export {
  aggregateHoldings,
  filterByCategory,
  calculateWeights,
  groupByCategory,
  calculateSummary,
} from './aggregator';
export {
  generateMasterCSV,
  generateCategoryCSV,
  generateSummaryCSV,
  generateAllCSVs,
} from './csvWriter';

import { parseMultipleCSVs } from './csvParser';
import { aggregateHoldings, groupByCategory, calculateSummary } from './aggregator';
import { generateAllCSVs } from './csvWriter';

/**
 * Process multiple CSV files and generate all output CSVs
 *
 * @param files - Array of file contents with filenames
 * @returns Object containing all generated CSV strings
 */
export function processHoldings(files: Array<{ content: string; filename: string }>) {
  // 1. Parse all CSV files
  const rawHoldings = parseMultipleCSVs(files);

  // 2. Aggregate by ticker symbol
  const aggregated = aggregateHoldings(rawHoldings);

  // 3. Group by category with weights
  const grouped = groupByCategory(aggregated);

  // 4. Calculate summary statistics
  const summary = calculateSummary(aggregated);

  // 5. Generate all CSV outputs
  const csvOutputs = generateAllCSVs(aggregated, grouped, summary);

  return {
    holdings: aggregated,
    grouped,
    summary,
    csvOutputs,
  };
}

/**
 * List of CSV files to process from the public directory
 */
export const CSV_FILES = [
  'Holdings-Jan-31-2026.csv',
  'Holdings-Jan-31-2026 (1).csv',
  'Holdings-Jan-31-2026 (2).csv',
  'Holdings-Jan-31-2026 (3).csv',
  'Portfolio_Positions_Jan-31-2026 (2).csv',
  'Portfolio_Positions_Jan-31-2026 (3).csv',
  'positions.csv',
  'positions1.csv',
  'positiosn2.csv',
  'positions3.csv',
  'positions4.csv',
];

/**
 * Output file names
 */
export const OUTPUT_FILES = {
  master: 'master.csv',
  stocks: 'stocks.csv',
  bonds: 'bonds.csv',
  cash: 'cash.csv',
  marketFunds: 'market_funds.csv',
  leveraged: 'leveraged.csv',
  summary: 'summary.csv',
};
