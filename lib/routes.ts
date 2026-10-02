/** Routes rendered as a distraction-free canvas (no site navbar/footer). */
export function isFocusRoute(pathname: string | null): boolean {
  return pathname !== null && /^\/exam\/[^/]+\/?$/.test(pathname);
}
