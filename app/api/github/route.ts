import { NextResponse } from "next/server";

/**
 * GitHub contribution levels for the redstone lamp wall. Proxied server-side
 * so the browser hits one cacheable same-origin endpoint instead of a
 * third-party API, and so an outage degrades gracefully (the wall falls
 * back to a placeholder pattern client-side when weeks is null).
 *
 * Upstream is the public jogruber contributions API (no token needed).
 * Cached at the edge for 12h — commit data doesn't need to be fresher.
 */
const USERNAME = "arshadakl";
const WEEKS = 26;

interface Contribution {
  date: string;
  count: number;
  level: number;
}

export async function GET() {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = (await res.json()) as {
      total?: Record<string, number>;
      contributions?: Contribution[];
    };
    const days = data.contributions ?? [];
    const recent = days.slice(-WEEKS * 7);
    // Column-major: weeks[w][d], oldest week first, Monday-agnostic (just
    // consecutive 7-day chunks — good enough for a lamp wall).
    const weeks: number[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      weeks.push(
        recent.slice(w * 7, w * 7 + 7).map((d) => Math.max(0, Math.min(4, d.level ?? 0)))
      );
    }
    const total = recent.reduce((sum, d) => sum + (d.count ?? 0), 0);

    return NextResponse.json(
      { weeks, total },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    // Client renders a deterministic placeholder when weeks is null
    return NextResponse.json(
      { weeks: null, total: null },
      { headers: { "Cache-Control": "public, max-age=600" } }
    );
  }
}
