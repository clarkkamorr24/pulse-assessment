"use client";

import { useState } from "react";

export default function EntryGate({
  onReady,
}: {
  onReady: (lat: number, lng: number) => void;
}) {
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");
  const [error, setError] = useState<string>("");

  function enter() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("Your browser doesn't support location access.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => onReady(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setStatus("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission is required to place you on the map."
            : "Couldn't get your location. Please try again.",
        );
      },
      // High accuracy + maximumAge:0 forces a fresh fix (Wi-Fi/GPS scan)
      // instead of reusing the browser's cached IP-based location.
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center gap-10 overflow-hidden bg-background p-6 text-zinc-100">
      {/* Aurora backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-40 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(52,211,153,0.25), rgba(34,211,238,0.18), rgba(16,185,129,0.0), rgba(52,211,153,0.25))",
            animation: "aurora 24s linear infinite",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--bg)_80%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 text-center">
        <div className="animate-slide-up">
          <div className="mb-5 flex items-center justify-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-linear-to-br from-emerald-400 to-cyan-400" />
            </span>
            <span className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-400">
              Pulse
            </span>
          </div>
          <h1 className="bg-linear-to-br from-white via-white to-zinc-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            Meet a stranger,
            <br />
            anywhere on Earth.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-zinc-400">
            A living globe of anonymous people. Drop onto the map, tap a glowing
            dot, and start talking — text or video, peer-to-peer.
          </p>
        </div>

        <button
          onClick={enter}
          disabled={status === "locating"}
          className="group relative animate-slide-up overflow-hidden rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-9 py-3.5 font-semibold text-zinc-950 shadow-[0_0_40px_-8px_rgba(52,211,153,0.7)] transition-all duration-300 hover:shadow-[0_0_50px_-4px_rgba(52,211,153,0.9)] disabled:opacity-60"
          style={{ animationDelay: "0.08s" }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {status === "locating" ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Finding you…
              </>
            ) : (
              <>Enter Pulse</>
            )}
          </span>
        </button>

        {status === "error" && (
          <p className="max-w-sm animate-fade-in text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <p
          className="max-w-sm animate-slide-up text-center text-xs leading-relaxed text-zinc-600"
          style={{ animationDelay: "0.16s" }}
        >
          No sign-up. Your dot lands 1–3&nbsp;km from your real location.
          Nothing is stored — closing the tab ends everything.
        </p>
      </div>
    </div>
  );
}
