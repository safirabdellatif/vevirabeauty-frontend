export function formatMAD(amount: number): string {
  return `${amount.toLocaleString("fr-MA")} درهم`;
}

export function formatMADCompact(amount: number): string {
  return `${amount} درهم`;
}

/** @deprecated use formatMAD — kept for gradual migration */
export const formatSAR = formatMAD;
export const formatSARCompact = formatMADCompact;

export function savingsAmount(fullPrice: number, offerPrice: number): number {
  return fullPrice - offerPrice;
}
