"use client";

// Reusable centered prompt for "someone wants to connect" and
// "someone wants to start video".
export default function ConnectionPrompt({
  title,
  subtitle,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
  icon = "connect",
}: {
  title: string;
  subtitle?: string;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
  icon?: "connect" | "video";
}) {
  return (
    <div className="absolute inset-0 z-40 flex animate-fade-in items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="glass w-full max-w-xs animate-pop-in rounded-3xl p-7 text-center text-zinc-100 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-400/20 to-cyan-400/20 ring-1 ring-emerald-400/30">
          {icon === "video" ? (
            <svg
              className="h-6 w-6 text-emerald-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-emerald-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <circle cx="12" cy="11" r="2.5" />
            </svg>
          )}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 rounded-full border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5"
          >
            {declineLabel}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_-6px_rgba(52,211,153,0.8)] transition hover:brightness-110"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
