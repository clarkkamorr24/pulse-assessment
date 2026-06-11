import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSessionId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/leave — removes the caller's presence row and any pending signals
// to/from them. Identity comes from the signed session cookie (sent
// automatically by navigator.sendBeacon on tab close), so a caller can only
// ever remove themselves — never force another user offline.
export async function POST(request: NextRequest) {
  const id = readSessionId(request);
  if (!id) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Independent cleanup deletes — no atomicity needed (and interactive
  // transactions are unreliable over a PgBouncer pooler).
  await prisma.signal.deleteMany({
    where: { OR: [{ toId: id }, { fromId: id }] },
  });
  await prisma.presence.deleteMany({ where: { id } });

  return Response.json({ ok: true });
}
