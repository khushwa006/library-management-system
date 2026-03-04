/**
 * Convert nanosecond timestamp (BigInt) to a human-readable date string.
 */
export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format fine amount in Rupees.
 */
export function formatFine(amount: bigint): string {
  const num = Number(amount);
  if (num === 0) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * Check if a due date (nanoseconds) is past the current time.
 */
export function isOverdue(dueDateNs: bigint, returnDateNs?: bigint): boolean {
  if (returnDateNs !== undefined) return false; // already returned
  const dueDateMs = Number(dueDateNs) / 1_000_000;
  return Date.now() > dueDateMs;
}

/**
 * Format member type with proper casing.
 */
export function formatMemberType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}…`;
}
