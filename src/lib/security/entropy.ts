/**
 * Entropy-based secret detection
 * High-entropy strings often indicate secrets, API keys, or encoded data
 */

/**
 * Calculate Shannon entropy of a string (bits per character)
 * Higher entropy = more random = more likely to be a secret
 */
export function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Detect high-entropy strings that may be secrets
 * Returns array of detected high-entropy segments
 */
export function detectHighEntropyStrings(
  content: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    entropyThreshold?: number;
  }
): { text: string; entropy: number; redacted: string }[] {
  const {
    minLength = 16,
    maxLength = 128,
    entropyThreshold = 4.0,
  } = options || {};

  const results: { text: string; entropy: number; redacted: string }[] = [];

  // Match potential secret-like strings (alphanumeric with some special chars)
  const pattern = /[A-Za-z0-9+/=_\-]{16,}/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const str = match[0];

    // Skip if too short or too long
    if (str.length < minLength || str.length > maxLength) continue;

    // Skip common false positives
    if (isLikelyFalsePositive(str)) continue;

    const entropy = calculateEntropy(str);

    if (entropy >= entropyThreshold) {
      results.push({
        text: str,
        entropy: Math.round(entropy * 100) / 100,
        redacted: redactString(str),
      });
    }
  }

  return results;
}

/**
 * Check if string is likely a false positive (common patterns that aren't secrets)
 */
function isLikelyFalsePositive(str: string): boolean {
  // All same character
  if (new Set(str).size <= 2) return true;

  // Common non-secret patterns
  const falsePositivePatterns = [
    /^[0-9]+$/, // All numbers
    /^[a-z]+$/i, // All letters (single case)
    /^(true|false|null|undefined|none|nil)+$/i,
    /^[A-Z_]+$/, // CONSTANT_CASE (likely variable names)
    /^(https?|ftp|file):\/\//i, // URLs (handled separately)
    /^[0-9a-f]{32}$/i, // MD5 hash (common, not always secret)
    /^[0-9a-f]{40}$/i, // SHA1 hash
    /^[0-9a-f]{64}$/i, // SHA256 hash
  ];

  return falsePositivePatterns.some((p) => p.test(str));
}

/**
 * Redact a string for safe display
 */
function redactString(str: string): string {
  if (str.length <= 8) return "****";
  return str.slice(0, 4) + "*".repeat(Math.min(str.length - 8, 20)) + str.slice(-4);
}

/**
 * Entropy classification
 */
export function classifyEntropy(entropy: number): "low" | "medium" | "high" | "very_high" {
  if (entropy < 3.0) return "low";
  if (entropy < 4.0) return "medium";
  if (entropy < 4.5) return "high";
  return "very_high";
}

/**
 * Get entropy description for UI
 */
export function getEntropyDescription(entropy: number): string {
  const classification = classifyEntropy(entropy);
  switch (classification) {
    case "low":
      return "Low randomness - likely normal text";
    case "medium":
      return "Moderate randomness - possibly encoded data";
    case "high":
      return "High randomness - likely a secret or key";
    case "very_high":
      return "Very high randomness - almost certainly a secret";
  }
}
