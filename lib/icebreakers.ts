export const ICEBREAKERS = [
  "What's a song you have on repeat right now?",
  "What's the weather like where you are?",
  "Tea or coffee — and how do you take it?",
  "What's the last thing that made you laugh?",
  "If you could teleport anywhere right now, where?",
  "What are you procrastinating on today?",
  "Best meal you've had this week?",
  "What's something small that made you happy recently?",
  "Cats, dogs, or something more exotic?",
  "What's a hobby you'd pick up if you had more time?",
  "Sunrise or sunset person?",
  "What's playing in the background right now?",
  "What's the view out your nearest window?",
  "Recommend me something — a show, book, or song.",
  "What's a place on your travel list?",
];

export function pickIcebreaker(exclude?: string | null): string {
  const pool = exclude
    ? ICEBREAKERS.filter((p) => p !== exclude)
    : ICEBREAKERS;
  return pool[Math.floor(Math.random() * pool.length)];
}
