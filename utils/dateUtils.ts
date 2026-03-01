/**
 * Formats any date string (ISO, yyyy-mm-dd, or anything parseable) to a clean
 * human-readable format: "17 Mar 2026"
 *
 * Returns '-' if the input is empty or invalid.
 */
export const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';

    // Extract yyyy-mm-dd from ISO strings like "2026-03-17T18:30:00.000Z"
    // Using a regex so we don't get timezone-shifted days from new Date() parsing
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '-';

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const day = parseInt(match[3], 10);

    // Build date in local time to avoid shift
    const d = new Date(year, month, day);

    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Extract a clean "yyyy-mm-dd" string from any date input.
 * Useful for comparisons and input[type=date] values.
 */
export const extractDatePart = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '';
    return `${match[1]}-${match[2]}-${match[3]}`;
};
