import { ImageResponse } from "next/og";
import { getResult } from "@/lib/server/attempts";
import { getExam } from "@/lib/server/exams";
import { getUser } from "@/lib/server/users";
import { verifyShareToken } from "@/lib/server/share";

export const dynamic = "force-dynamic";

// Link-preview image for Facebook/WhatsApp. The image renderer can't shape
// Bangla script, so this card uses English text and Latin digits only; the
// downloadable card (lib/result-card.ts) is drawn in the browser in Bangla.
const latin = (s?: string) => (s && /^[\x20-\x7E\u2013\u2014\u2018\u2019\u201C\u201D]+$/.test(s) ? s : undefined);
const num = (n: number) => String(Number(n.toFixed(2)));

export async function GET(req: Request, { params }: { params: { attemptId: string } }) {
  const t = new URL(req.url).searchParams.get("t") ?? undefined;
  if (!verifyShareToken(params.attemptId, t)) return new Response("Not found", { status: 404 });
  const data = await getResult(params.attemptId);
  if (!data) return new Response("Not found", { status: 404 });
  const [exam, user] = await Promise.all([getExam(data.attempt.examId), getUser(data.attempt.userId)]);
  const r = data.result;
  const pct = r.totalMarks > 0 ? Math.max(0, Math.min(1, r.score / r.totalMarks)) : 0;
  const title = latin(exam?.titleEn) ?? "Live Exam";
  const name = latin(user?.name);

  const stat = (label: string, value: string) => (
    <div style={{ display: "flex", flexDirection: "column", padding: "20px 24px", background: "#042E1B", borderRadius: 18, width: 196 }}>
      <span style={{ fontSize: 20, color: "#A7BDB5" }}>{label}</span>
      <span style={{ fontSize: 36, fontWeight: 700, color: "#FFFFFF" }}>{value}</span>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#001B11", padding: 40 }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#012819",
            borderRadius: 32,
            border: "2px solid #29473C",
            padding: "44px 48px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 660 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#99FE00",
                  color: "#065136",
                  fontSize: 18,
                  fontWeight: 800,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                STA
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF" }}>Shokher Tech Academy</span>
            </div>
            <span style={{ marginTop: 48, fontSize: 24, color: "#A7BDB5" }}>{name ? `${name}'s result` : "Exam result"}</span>
            <span style={{ marginTop: 6, fontSize: 42, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>{title}</span>
            <div style={{ display: "flex", gap: 18, marginTop: "auto" }}>
              {stat("Rank", `#${r.rank} of ${r.participants}`)}
              {stat("Accuracy", `${r.accuracy}%`)}
              {stat("Correct", `${r.correct}/${r.questions.length}`)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 320 }}>
            <div style={{ display: "flex", position: "relative", width: 300, height: 300, alignItems: "center", justifyContent: "center" }}>
              <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: "absolute", top: 0, left: 0 }}>
                <circle cx="150" cy="150" r="130" fill="none" stroke="#1F382F" strokeWidth="26" />
                <circle
                  cx="150"
                  cy="150"
                  r="130"
                  fill="none"
                  stroke="#99FE00"
                  strokeWidth="26"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 130 * pct} ${2 * Math.PI * 130}`}
                  transform="rotate(-90 150 150)"
                />
              </svg>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ fontSize: 84, fontWeight: 700, color: "#FFFFFF" }}>{num(r.score)}</span>
                  <span style={{ fontSize: 34, fontWeight: 600, color: "#A7BDB5" }}>/{num(r.totalMarks)}</span>
                </div>
                <span style={{ fontSize: 22, color: "#A7BDB5" }}>Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
