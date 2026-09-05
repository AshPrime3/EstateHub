/**
 * Generate CSV string from rows.
 * Properly escapes values containing commas, quotes, or newlines.
 */
export function generateCSV(headers: string[], rows: string[][]): string {
  const escapeValue = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = headers.map(escapeValue).join(',');
  const dataLines = rows.map((row) => row.map(escapeValue).join(','));

  return [headerLine, ...dataLines].join('\n');
}
