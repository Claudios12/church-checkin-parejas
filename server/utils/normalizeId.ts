/**
 * Normalizes parent ID by removing special characters and formatting
 * Accepts Colombian IDs (8-10 digits) and foreign IDs (alphanumeric)
 *
 * Examples:
 * - "1.007.557.871" → "1007557871"
 * - "V-12345678" → "V12345678"
 * - "AB 123456" → "AB123456"
 * - "100 755 7871" → "1007557871"
 *
 * @param id - Raw parent ID input
 * @returns Normalized ID (uppercase alphanumeric only)
 */
export function normalizeParentId(id: string): string {
  if (!id) return ''

  // Remove all non-alphanumeric characters (spaces, dots, hyphens, underscores, etc.)
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, '')

  // Convert to uppercase for consistency
  return cleaned.toUpperCase()
}

/**
 * Validates normalized parent ID format
 * Accepts:
 * - Pure numeric: 6-15 digits (Colombian IDs typically 8-10)
 * - Alphanumeric: 6-15 characters (foreign IDs like Venezuelan V12345678)
 *
 * @param normalizedId - Already normalized ID
 * @returns true if valid format
 */
export function isValidParentId(normalizedId: string): boolean {
  if (!normalizedId) return false

  const length = normalizedId.length

  // Must be between 6 and 15 characters (prevents abuse, accommodates various formats)
  if (length < 6 || length > 15) return false

  // Must contain only alphanumeric characters
  return /^[A-Z0-9]+$/.test(normalizedId)
}
