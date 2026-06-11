import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyPrivacyOffset, isValidLatLng } from "@/lib/geo";
import { newSessionId, sessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/join — body { lat, lng } (raw coords).
// The server mints the session id (never trusting a client-supplied id),
// applies a 1–3 km privacy offset, upserts the presence row, and returns the
// id inside a signed HttpOnly cookie that authenticates later requests.
// Raw coordinates are never stored.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const { lat, lng } = (body ?? {}) as Record<string, unknown>;

  if (!isValidLatLng(lat, lng)) {
    return Response.json({ error: "invalid coordinates" }, { status: 400 });
  }

  const id = newSessionId();
  const offset = applyPrivacyOffset(lat as number, lng as number);

  await prisma.presence.create({
    data: {
      id,
      lat: offset.lat,
      lng: offset.lng,
      busy: false,
      lastSeen: new Date(),
    },
  });

  return Response.json(
    { ok: true, id },
    { headers: { "Set-Cookie": sessionCookie(id) } },
  );
}
