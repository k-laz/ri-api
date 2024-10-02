import crypto from "crypto";

/**
 * Generates a hash for a given string (e.g., a URL or listing link).
 * This can be used to uniquely identify or deduplicate listings.
 *
 * @param input - The input string (e.g., URL or link) to generate the hash from.
 * @returns A unique hash string for the input.
 */
export default function generateListingHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
