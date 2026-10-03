/** Normalises +8801XXXXXXXXX / 8801… / 01… (with spaces or dashes) to 01XXXXXXXXX, or null if invalid. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "").replace(/^\+?88/, "");
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}

/** 01712345678 → 01712-345678 */
export function formatPhone(phone: string): string {
  return phone.length === 11 ? `${phone.slice(0, 5)}-${phone.slice(5)}` : phone;
}
