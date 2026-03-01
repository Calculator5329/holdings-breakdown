import { HoldingCategory } from './types';
import type { RawHolding, AggregatedHolding, WeightedHolding } from './types';
import { normalizeSymbol, categorizeSymbol } from './categories';

/**
 * Aggregate raw holdings by symbol, summing values across all sources
 */
export function aggregateHoldings(rawHoldings: RawHolding[]): AggregatedHolding[] {
  const holdingMap = new Map<
    string,
    { symbol: string; name: string; totalValue: number }
  >();

  for (const holding of rawHoldings) {
    const normalizedSymbol = normalizeSymbol(holding.symbol);

    if (holdingMap.has(normalizedSymbol)) {
      const existing = holdingMap.get(normalizedSymbol)!;
      existing.totalValue += holding.value;
      // Keep the longer/more descriptive name
      if (holding.name.length > existing.name.length) {
        existing.name = holding.name;
      }
    } else {
      holdingMap.set(normalizedSymbol, {
        symbol: normalizedSymbol,
        name: holding.name,
        totalValue: holding.value,
      });
    }
  }

  // Convert to array and add categories
  const aggregated: AggregatedHolding[] = [];

  for (const [symbol, data] of holdingMap) {
    aggregated.push({
      symbol: data.symbol,
      name: data.name,
      totalValue: data.totalValue,
      category: categorizeSymbol(symbol),
    });
  }

  // Sort by value descending
  return aggregated.sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Filter holdings by category
 */
export function filterByCategory(
  holdings: AggregatedHolding[],
  category: HoldingCategory
): AggregatedHolding[] {
  return holdings.filter((h) => h.category === category);
}

/**
 * Calculate weights for holdings within a category
 */
export function calculateWeights(holdings: AggregatedHolding[]): WeightedHolding[] {
  const total = holdings.reduce((sum, h) => sum + h.totalValue, 0);

  return holdings.map((h) => ({
    ...h,
    weight: total > 0 ? (h.totalValue / total) * 100 : 0,
  }));
}

/**
 * Get holdings grouped by category with weights
 */
export function groupByCategory(
  holdings: AggregatedHolding[]
): Record<HoldingCategory, WeightedHolding[]> {
  const result: Record<HoldingCategory, WeightedHolding[]> = {
    [HoldingCategory.CASH]: [],
    [HoldingCategory.BONDS]: [],
    [HoldingCategory.STOCKS]: [],
    [HoldingCategory.MARKET_FUNDS]: [],
    [HoldingCategory.LEVERAGED]: [],
  };

  for (const category of Object.values(HoldingCategory)) {
    const filtered = filterByCategory(holdings, category);
    result[category] = calculateWeights(filtered);
  }

  return result;
}

/**
 * Calculate summary statistics
 */
export function calculateSummary(holdings: AggregatedHolding[]): {
  totalValue: number;
  byCategory: Record<HoldingCategory, { value: number; percentage: number }>;
} {
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);

  const byCategory: Record<HoldingCategory, { value: number; percentage: number }> = {
    [HoldingCategory.CASH]: { value: 0, percentage: 0 },
    [HoldingCategory.BONDS]: { value: 0, percentage: 0 },
    [HoldingCategory.STOCKS]: { value: 0, percentage: 0 },
    [HoldingCategory.MARKET_FUNDS]: { value: 0, percentage: 0 },
    [HoldingCategory.LEVERAGED]: { value: 0, percentage: 0 },
  };

  for (const holding of holdings) {
    byCategory[holding.category].value += holding.totalValue;
  }

  for (const category of Object.values(HoldingCategory)) {
    byCategory[category].percentage =
      totalValue > 0 ? (byCategory[category].value / totalValue) * 100 : 0;
  }

  return { totalValue, byCategory };
}
