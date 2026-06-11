"use client";

import { useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: number;
  mine: boolean;
  text: string;
}

export default function ChatPanel({
  messages,
  connected,
  videoBusy,
  onSend,
  onStartVideo,
  onEnd,
}: {
  messages: ChatMessage[];
  connected: boolean;
  videoBusy: boolean;
  onSend: (text: string) => void;
  onStartVideo: () => void;
  onEnd: () => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !connected) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div className="glass absolute inset-y-0 right-0 z-20 flex w-full max-w-md translate-x-0 animate-slide-up flex-col border-l border-white/10 text-zinc-100 shadow-2xl sm:m-3 sm:inset-y-3 sm:right-3 sm:rounded-3xl sm:border">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-emerald-400/30 to-cyan-400/30 text-base ring-1 ring-white/10">
            🌐
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Stranger</p>
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              {connected ? (
                <>
                  <span className="live-dot h-1.5 w-1.5" />
                  Connected
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  Connecting…
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onStartVideo}
            disabled={!connected || videoBusy}
            title="Start video call"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-200 transition hover:border-white/30 hover:bg-white/5 disabled:opacity-30"
          >
            <svg
              className="h-4.5 w-4.5"
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
          </button>
          <button
            onClick={onEnd}
            title="End connection"
            className="flex h-9 items-center rounded-full bg-red-500/90 px-4 text-sm font-medium text-white transition hover:bg-red-500"
          >
            End
          </button>
        </div>
      </header>

      <div className="scroll-thin flex-1 space-y-2.5 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl">
              👋
            </div>
            <p className="max-w-60 text-sm text-zinc-500">
              Say hello. Messages are peer-to-peer and never stored.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m.id}
            className={`flex animate-slide-up ${
              m.mine ? "justify-end" : "justify-start"
            }`}
            style={{ animationDelay: `${Math.min(i, 6) * 0.02}s` }}
          >
            <span
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                m.mine
                  ? "rounded-br-md bg-linear-to-br from-emerald-400 to-cyan-400 text-zinc-950"
                  : "rounded-bl-md bg-white/10 text-zinc-100"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={connected ? "Type a message…" : "Connecting…"}
          disabled={!connected}
          className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm outline-none ring-1 ring-white/10 transition placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-400/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || !draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 text-zinc-950 transition hover:brightness-110 disabled:opacity-40"
        >
          <svg
            className="h-4.5 w-4.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M13 6l6 6-6 6"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
