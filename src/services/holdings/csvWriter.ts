import { HoldingCategory } from './types';
import type { AggregatedHolding, WeightedHolding } from './types';
import { getCategoryDisplayName } from './categories';

/**
 * Escape a CSV value (handle commas, quotes, etc.)
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format a number as currency string
 */
function formatCurrency(value: number): string {
  return value.toFixed(2);
}

/**
 * Format a number as percentage string
 */
function formatPercentage(value: number): string {
  return value.toFixed(2);
}

/**
 * Generate master CSV content
 */
export function generateMasterCSV(holdings: AggregatedHolding[]): string {
  const lines: string[] = [];

  // Header
  lines.push('Symbol,Name,Total Value,Category');

  // Data rows
  for (const holding of holdings) {
    const row = [
      escapeCSV(holding.symbol),
      escapeCSV(holding.name),
      formatCurrency(holding.totalValue),
      getCategoryDisplayName(holding.category),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Generate category-specific CSV content
 */
export function generateCategoryCSV(holdings: WeightedHolding[]): string {
  const lines: string[] = [];

  // Header
  lines.push('Symbol,Name,Total Value,Weight (%)');

  // Data rows
  for (const holding of holdings) {
    const row = [
      escapeCSV(holding.symbol),
      escapeCSV(holding.name),
      formatCurrency(holding.totalValue),
      formatPercentage(holding.weight),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Generate summary CSV content
 */
export function generateSummaryCSV(summary: {
  totalValue: number;
  byCategory: Record<HoldingCategory, { value: number; percentage: number }>;
}): string {
  const lines: string[] = [];

  // Header
  lines.push('Category,Value,Percentage (%)');

  // Data rows by category
  for (const category of Object.values(HoldingCategory)) {
    const data = summary.byCategory[category];
    const row = [
      getCategoryDisplayName(category),
      formatCurrency(data.value),
      formatPercentage(data.percentage),
    ];
    lines.push(row.join(','));
  }

  // Total row
  lines.push(`Total,${formatCurrency(summary.totalValue)},100.00`);

  return lines.join('\n');
}

/**
 * Generate all CSV outputs
 */
export function generateAllCSVs(
  holdings: AggregatedHolding[],
  groupedHoldings: Record<HoldingCategory, WeightedHolding[]>,
  summary: {
    totalValue: number;
    byCategory: Record<HoldingCategory, { value: number; percentage: number }>;
  }
): {
  master: string;
  stocks: string;
  bonds: string;
  cash: string;
  marketFunds: string;
  leveraged: string;
  summary: string;
} {
  return {
    master: generateMasterCSV(holdings),
    stocks: generateCategoryCSV(groupedHoldings[HoldingCategory.STOCKS]),
    bonds: generateCategoryCSV(groupedHoldings[HoldingCategory.BONDS]),
    cash: generateCategoryCSV(groupedHoldings[HoldingCategory.CASH]),
    marketFunds: generateCategoryCSV(groupedHoldings[HoldingCategory.MARKET_FUNDS]),
    leveraged: generateCategoryCSV(groupedHoldings[HoldingCategory.LEVERAGED]),
    summary: generateSummaryCSV(summary),
  };
}
