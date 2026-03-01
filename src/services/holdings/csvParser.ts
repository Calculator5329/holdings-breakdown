import type { RawHolding, CsvFormat, ParseResult } from './types';

/**
 * Parse a CSV string into rows
 */
function parseCSVRows(content: string): string[][] {
  const lines = content.split('\n');
  const rows: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Simple CSV parsing that handles quoted values with commas
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Clean a currency value string to a number
 * Handles: "$1,234.56", "1,234.56", "-$45.67", etc.
 */
function parseCurrencyValue(value: string): number {
  if (!value || value === '') return 0;

  // Remove $, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '');

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Detect the CSV format based on headers
 */
function detectFormat(headers: string[]): CsvFormat {
  const headerStr = headers.join(',').toLowerCase();

  // Fidelity format has "Account Number" or "Current Value"
  if (headerStr.includes('account number') || headerStr.includes('current value')) {
    return 'fidelity';
  }

  // Robinhood format has simpler headers with "Value" at the end
  return 'robinhood';
}

/**
 * Check if a row should be skipped
 */
function shouldSkipRow(row: string[]): boolean {
  if (row.length === 0) return true;

  const firstCell = row[0]?.toLowerCase() || '';

  // Skip disclaimer text (starts with quote or contains legal text)
  if (firstCell.startsWith('"the data')) return true;
  if (firstCell.startsWith('"brokerage')) return true;
  if (firstCell.startsWith('"date downloaded')) return true;
  if (firstCell.includes('data and information')) return true;
  if (firstCell.includes('brokerage services')) return true;

  // Skip pending activity
  if (firstCell === 'pending activity' || row[2]?.toLowerCase() === 'pending activity') return true;

  // Skip empty symbol rows
  const symbol = row[0] || row[2] || '';
  if (!symbol.trim()) return true;

  return false;
}

/**
 * Parse Robinhood format CSV
 * Columns: Symbol, Name, Quantity, Avg. Price, Cost Basis, Unrealized Gain ($), Unrealized Gain (%), Value
 */
function parseRobinhoodFormat(rows: string[][], filename: string): RawHolding[] {
  const holdings: RawHolding[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (shouldSkipRow(row)) continue;

    const symbol = row[0]?.trim();
    const name = row[1]?.trim() || symbol;
    const quantity = parseFloat(row[2]?.replace(/,/g, '') || '0');
    const value = parseCurrencyValue(row[7]); // Value is column 8 (index 7)

    if (symbol && value > 0) {
      holdings.push({ symbol, name, quantity, value, source: filename });
    }
  }

  return holdings;
}

/**
 * Parse Fidelity format CSV
 * Columns: Account Number, Account Name, Symbol, Description, Quantity, Last Price, Last Price Change, Current Value, ...
 */
function parseFidelityFormat(rows: string[][], filename: string): RawHolding[] {
  const holdings: RawHolding[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (shouldSkipRow(row)) continue;

    const symbol = row[2]?.trim(); // Symbol is column 3 (index 2)
    const name = row[3]?.trim() || symbol; // Description is column 4 (index 3)
    const quantity = parseFloat(row[4]?.replace(/,/g, '') || '0');
    const value = parseCurrencyValue(row[7]); // Current Value is column 8 (index 7)

    if (symbol && value !== 0) {
      // Allow negative values for some edge cases, but filter out zeros
      holdings.push({
        symbol,
        name,
        quantity,
        value: Math.abs(value), // Use absolute value
        source: filename,
      });
    }
  }

  return holdings;
}

/**
 * Parse a CSV file content
 */
export function parseCSV(content: string, filename: string): ParseResult {
  const rows = parseCSVRows(content);

  if (rows.length === 0) {
    return { holdings: [], format: 'robinhood', filename };
  }

  const headers = rows[0];
  const format = detectFormat(headers);

  const holdings =
    format === 'robinhood'
      ? parseRobinhoodFormat(rows, filename)
      : parseFidelityFormat(rows, filename);

  return { holdings, format, filename };
}

/**
 * Parse multiple CSV file contents
 */
export function parseMultipleCSVs(
  files: Array<{ content: string; filename: string }>
): RawHolding[] {
  const allHoldings: RawHolding[] = [];

  for (const file of files) {
    const result = parseCSV(file.content, file.filename);
    allHoldings.push(...result.holdings);
  }

  return allHoldings;
}
