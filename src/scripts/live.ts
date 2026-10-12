export type PrivacyChoice = "accepted" | "declined" | "unset";

export type ScheduledStream = {
  title?: string;
  startTime: string;
  endTime?: string;
  canceledUntil?: string | null;
  category?: string | null;
};

export type TwitchData = {
  live: { isLive: boolean; title?: string; gameName?: string | null; viewerCount?: number | null } | null;
  video: { title: string; url: string; thumbnailUrl: string | null; publishedAt: string | null } | null;
  schedule: ScheduledStream[];
};

const CACHE_MS = 60_000;
let cached: { at: number; request: Promise<TwitchData> } | null = null;

export const getTwitch = () => {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.request;
  const request = fetch("/api/twitch").then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error ?? `Twitch route returned ${response.status}`);
    return data as TwitchData;
  });
  cached = { at: Date.now(), request };
  request.catch(() => { cached = null; });
  return request;
};

export const privacyChoice = (): PrivacyChoice => {
  const choice = document.documentElement.dataset.privacyChoice;
  return choice === "accepted" || choice === "declined" ? choice : "unset";
};

export const onPrivacyChoice = (handler: (choice: PrivacyChoice) => void) => {
  window.addEventListener("mochiko:privacy-choice", () => handler(privacyChoice()));
};

export const upcomingStreams = (schedule: ScheduledStream[] = []) => schedule
  .filter((stream) => !stream.canceledUntil && new Date(stream.startTime).getTime() > Date.now() - 15 * 60_000)
  .sort((a, b) => a.startTime.localeCompare(b.startTime));

export const formatStreamTime = (value: string) => new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
}).format(new Date(value)).replace(/\./g, "").toLowerCase();
