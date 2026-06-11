"use client";

import { useEffect, useRef } from "react";

export default function VideoPanel({
  localStream,
  remoteStream,
  onEnd,
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEnd: () => void;
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localRef.current && localRef.current.srcObject !== localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteRef.current.srcObject !== remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="absolute inset-0 z-30 flex animate-fade-in flex-col bg-black">
      <div className="relative flex-1 overflow-hidden">
        {/* Remote (full screen) */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="h-full w-full bg-zinc-950 object-cover"
        />

        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400/20 to-cyan-400/20 text-3xl ring-1 ring-emerald-400/30">
                🌐
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Waiting for stranger&rsquo;s video…
            </p>
          </div>
        )}

        {/* Top gradient for control legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/50 to-transparent" />

        {/* Local (picture-in-picture) */}
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 h-40 w-28 animate-pop-in rounded-2xl border border-white/15 bg-zinc-900 object-cover shadow-2xl sm:h-48 sm:w-36"
        />
      </div>

      <div className="flex justify-center bg-linear-to-t from-black to-zinc-950/80 p-5">
        <button
          onClick={onEnd}
          className="flex items-center gap-2 rounded-full bg-red-500 px-7 py-3 font-semibold text-white shadow-[0_0_30px_-8px_rgba(239,68,68,0.9)] transition hover:bg-red-400"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5l3.5 3.5a13 13 0 0011 11L21 16l-4-1-2 2a11 11 0 01-5-5l2-2-1-4H3z"
            />
          </svg>
          End video
        </button>
      </div>
    </div>
  );
}
