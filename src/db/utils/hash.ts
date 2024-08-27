import { createHash } from "crypto";

export default function generateListingHash(link: string): string {
  const hash = createHash("sha256");
  hash.update(link);
  return hash.digest("hex");
}
