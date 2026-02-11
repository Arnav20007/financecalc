/**
 * FinanceCalc — Formatting Utilities
 */

/**
 * Format number as currency
 * @param {number} value
 * @param {string} currency - Currency code (default: USD)
 * @returns {string}
 */
export function formatCurrency(value, currency = 'USD') {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format number with commas
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format percentage
 * @param {number} value
 * @returns {string}
 */
export function formatPercent(value) {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    return `${value.toFixed(2)}%`;
}

/**
 * Format months into years and months string
 * @param {number} months
 * @returns {string}
 */
export function formatMonthsToYears(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Parse numeric input (removes commas, $, etc.)
 * @param {string} value
 * @returns {number}
 */
export function parseNumericInput(value) {
    if (typeof value === 'number') return value;
    return parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
}
