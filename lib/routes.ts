/** Routes rendered as a distraction-free canvas (no site navbar/footer). */
export function isFocusRoute(pathname: string | null): boolean {
  return pathname !== null && /^\/exam\/[^/]+\/?$/.test(pathname);
}

/** Where every "live exam" call to action points: the list of live exams. */
export const LIVE_EXAM_HREF = "/live";
