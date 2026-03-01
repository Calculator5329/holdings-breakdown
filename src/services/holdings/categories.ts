import { HoldingCategory } from './types';
import type { HoldingCategory as HoldingCategoryType } from './types';

/**
 * Cash holdings - money market accounts, stable value funds
 */
const CASH_SYMBOLS = new Set([
  'SPAXX',
  '878094101', // TIAA Traditional
]);

/**
 * Bond holdings - bond ETFs, bond funds, CDs
 */
const BOND_SYMBOLS = new Set([
  'BLV',
  'BNDX',
  'BND',
  'AGG',
  'FNBGX',
]);

/**
 * Leveraged ETFs - 2x and 3x funds
 */
const LEVERAGED_SYMBOLS = new Set([
  'TNA',
  'TQQQ',
  'SPXL',
  'CURE',
  'SOXL',
  'WEBL',
  'TMF',
  'TSLL',
  'USD',
  'PYPG',
  'ADBG',
  'DUOG',
  'KMLI',
  'AMZU',
]);

/**
 * Market funds - index funds, broad market ETFs
 */
const MARKET_FUND_SYMBOLS = new Set([
  'FSKAX',
  'VTI',
  'SCHB',
  'QQQ',
  'VXF',
  'VSCIX',
  'FCNKX',
  'VIIIX',
  'VITPX',
  'FSPSX',
  'FPADX',
  'FSMAX',
  'SPY',
  'VOOG',
  'SOXX',
  'FDN',
  'PNQI',
  'ARKK',
  'SPSM',
  'NON40OJFE',
  'VXUS',
  'SGOV',
]);

/**
 * Normalize a symbol for lookup (remove special chars like **)
 */
export function normalizeSymbol(symbol: string): string {
  return symbol.replace(/\*+$/, '').trim().toUpperCase();
}

/**
 * Check if a symbol looks like a CD (CUSIP format)
 * CDs typically have alphanumeric codes like "61776CFC6"
 */
function isCdSymbol(symbol: string): boolean {
  // CDs have mixed letters and numbers, typically 9 chars
  return /^[A-Z0-9]{8,12}$/.test(symbol) && /\d/.test(symbol) && /[A-Z]/.test(symbol);
}

/**
 * Categorize a holding based on its symbol
 */
export function categorizeSymbol(symbol: string): HoldingCategoryType {
  const normalized = normalizeSymbol(symbol);

  if (CASH_SYMBOLS.has(normalized)) {
    return HoldingCategory.CASH;
  }

  if (BOND_SYMBOLS.has(normalized)) {
    return HoldingCategory.BONDS;
  }

  // CDs are classified as bonds
  if (isCdSymbol(normalized)) {
    return HoldingCategory.BONDS;
  }

  if (LEVERAGED_SYMBOLS.has(normalized)) {
    return HoldingCategory.LEVERAGED;
  }

  if (MARKET_FUND_SYMBOLS.has(normalized)) {
    return HoldingCategory.MARKET_FUNDS;
  }

  // Default to stocks for individual company tickers
  return HoldingCategory.STOCKS;
}

/**
 * Get a human-readable category name
 */
export function getCategoryDisplayName(category: HoldingCategoryType): string {
  const names: Record<HoldingCategoryType, string> = {
    [HoldingCategory.CASH]: 'Cash',
    [HoldingCategory.BONDS]: 'Bonds',
    [HoldingCategory.STOCKS]: 'Stocks',
    [HoldingCategory.MARKET_FUNDS]: 'Market Funds',
    [HoldingCategory.LEVERAGED]: 'Leveraged',
  };
  return names[category];
}
