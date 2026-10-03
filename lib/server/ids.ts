/** Short prefixed random ids, e.g. usr_3f9a1c0b2d4e5f60. */
export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
