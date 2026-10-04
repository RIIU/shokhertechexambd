import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/** Lets client components (the navbar) know who is signed in without making every page dynamic. */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    {
      user: user
        ? {
            id: user.id,
            name: user.name,
            role: user.role,
            phone: user.phone,
            level: user.level,
            stream: user.stream,
            institution: user.institution,
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl,
            bio: user.bio,
          }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
