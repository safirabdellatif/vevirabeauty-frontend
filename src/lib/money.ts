export function formatMAD(amount: number): string {
  return `${amount.toLocaleString("ar-MA")} درهم`;
}

export function formatMADCompact(amount: number): string {
  return `${amount} درهم`;
}

export function savingsAmount(fullPrice: number, offerPrice: number): number {
  return fullPrice - offerPrice;
}

// Aliases for backward compatibility
export const formatSAR = formatMAD;
export const formatSARCompact = formatMADCompact;
