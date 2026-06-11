"use client";

import { useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  mine: boolean;
  text: string;
  reactions: Record<string, number>;
}

const REACTIONS = ["❤️", "😂", "👍", "😮", "🔥"];

export default function ChatPanel({
  messages,
  connected,
  videoBusy,
  prompt,
  peerTyping,
  onSend,
  onTyping,
  onReact,
  onNewPrompt,
  onStartVideo,
  onEnd,
}: {
  messages: ChatMessage[];
  connected: boolean;
  videoBusy: boolean;
  prompt: string | null;
  peerTyping: boolean;
  onSend: (text: string) => void;
  onTyping: () => void;
  onReact: (mid: string, emoji: string) => void;
  onNewPrompt: () => void;
  onStartVideo: () => void;
  onEnd: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [reactingId, setReactingId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

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

      {connected && prompt && (
        <div className="mx-3 mt-3 flex animate-pop-in items-start gap-2.5 rounded-2xl border border-emerald-400/20 bg-linear-to-br from-emerald-400/10 to-cyan-400/5 px-3.5 py-3">
          <span className="mt-0.5 text-base">💬</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
              Icebreaker
            </p>
            <p className="text-sm leading-snug text-zinc-100">{prompt}</p>
          </div>
          <button
            onClick={onNewPrompt}
            title="New icebreaker"
            className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M5 19A9 9 0 0119 5"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="scroll-thin flex-1 space-y-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl">
              👋
            </div>
            <p className="max-w-60 text-sm text-zinc-500">
              Say hello. Messages are peer-to-peer and never stored.
            </p>
          </div>
        )}
        {messages.map((m, i) => {
          const reactions = Object.entries(m.reactions);
          return (
            <div
              key={m.id}
              className={`group flex animate-slide-up flex-col ${
                m.mine ? "items-end" : "items-start"
              }`}
              style={{ animationDelay: `${Math.min(i, 6) * 0.02}s` }}
            >
              <div
                className={`flex items-center gap-1.5 ${
                  m.mine ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span
                  className={`max-w-64 rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                    m.mine
                      ? "rounded-br-md bg-linear-to-br from-emerald-400 to-cyan-400 text-zinc-950"
                      : "rounded-bl-md bg-white/10 text-zinc-100"
                  }`}
                >
                  {m.text}
                </span>

                {/* Add-reaction affordance */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setReactingId((cur) => (cur === m.id ? null : m.id))
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 opacity-0 transition hover:bg-white/10 hover:text-zinc-200 focus:opacity-100 group-hover:opacity-100"
                    title="React"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        strokeLinecap="round"
                        d="M9 10h.01M15 10h.01M9 15c.8.6 1.8 1 3 1s2.2-.4 3-1"
                      />
                    </svg>
                  </button>

                  {reactingId === m.id && (
                    <>
                      <button
                        className="fixed inset-0 z-10 cursor-default"
                        aria-label="Close reactions"
                        onClick={() => setReactingId(null)}
                      />
                      <div
                        className={`glass absolute bottom-8 z-20 flex animate-pop-in gap-1 rounded-full px-1.5 py-1 shadow-xl ${
                          m.mine ? "right-0" : "left-0"
                        }`}
                      >
                        {REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              onReact(m.id, emoji);
                              setReactingId(null);
                            }}
                            className="rounded-full p-1 text-lg transition hover:scale-125"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Reaction chips */}
              {reactions.length > 0 && (
                <div
                  className={`mt-1 flex flex-wrap gap-1 ${
                    m.mine ? "justify-end" : "justify-start"
                  }`}
                >
                  {reactions.map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className="flex items-center gap-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-xs ring-1 ring-white/10"
                    >
                      {emoji}
                      {count > 1 && (
                        <span className="text-zinc-400">{count}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {peerTyping && (
          <div className="flex animate-fade-in justify-start pt-1">
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (connected) onTyping();
          }}
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
