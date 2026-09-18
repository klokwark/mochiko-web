import type { APIRoute } from "astro";

export const prerender = false;

const CHANNEL = "mochikolive";
const DECAPI = "https://decapi.me/twitch";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  },
});

const getText = async (path: string) => {
  const response = await fetch(`${DECAPI}/${path}`, {
    headers: { "User-Agent": "MochikoWebsite/1.0" },
    signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) throw new Error(`DecAPI returned ${response.status}`);
  return (await response.text()).trim();
};

const unfoldIcal = (input: string) => input.replace(/\r?\n[ \t]/g, "");
const unescapeIcal = (input: string) => input.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");

const parseIcalDate = (line: string) => {
  const value = line.slice(line.indexOf(":") + 1).trim();
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) return "";
  const [, year, month, day, hour, minute, second, utc] = match;
  if (utc === "Z") return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;

  const zone = line.match(/TZID=([^:;]+)/)?.[1];
  const target = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
  if (!zone) return new Date(target).toISOString();

  let instant = target;
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(instant)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    instant += target - shown;
  }
  return new Date(instant).toISOString();
};

const getSchedule = async (broadcasterId: string) => {
  const response = await fetch(`https://api.twitch.tv/helix/schedule/icalendar?broadcaster_id=${encodeURIComponent(broadcasterId)}`, {
    headers: { "User-Agent": "MochikoWebsite/1.0" },
    signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) throw new Error(`Twitch calendar returned ${response.status}`);
  const calendar = unfoldIcal(await response.text());
  const now = Date.now() - 60 * 60 * 1000;
  return calendar.split("BEGIN:VEVENT").slice(1).map((block) => {
    const lines = block.split(/\r?\n/);
    const startLine = lines.find((line) => line.startsWith("DTSTART")) ?? "";
    const endLine = lines.find((line) => line.startsWith("DTEND")) ?? "";
    const field = (name: string) => unescapeIcal((lines.find((line) => line.startsWith(`${name}:`)) ?? "").slice(name.length + 1).trim());
    return {
      title: field("SUMMARY") || "stream time!",
      startTime: parseIcalDate(startLine),
      endTime: parseIcalDate(endLine),
      category: field("CATEGORIES") || null,
      canceledUntil: null,
    };
  }).filter((event) => event.startTime && new Date(event.startTime).getTime() > now).sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 6);
};

export const GET: APIRoute = async () => {
  try {
    const userId = await getText(`userid/${CHANNEL}`);
    const [uptimeResult, titleResult, gameResult, viewersResult, videoResult, scheduleResult] = await Promise.allSettled([
      getText(`uptime/${CHANNEL}?offline_msg=offline`),
      getText(`title/${CHANNEL}`),
      getText(`game/${CHANNEL}`),
      getText(`viewercount/${CHANNEL}`),
      getText(`videos/${CHANNEL}?limit=1&video_format=%24%7Btitle%7D%7C%7C%7C%24%7Burl%7D`),
      getSchedule(userId),
    ]);

    const value = (result: PromiseSettledResult<string>) => result.status === "fulfilled" ? result.value : "";
    const uptime = value(uptimeResult);
    const isLive = Boolean(uptime && uptime.toLowerCase() !== "offline" && !uptime.toLowerCase().includes("is offline"));
    const title = value(titleResult);
    const gameName = value(gameResult);
    const viewerCount = Number.parseInt(value(viewersResult), 10);

    const videoRaw = value(videoResult);
    const separator = videoRaw.lastIndexOf("|||");
    const videoTitle = separator > -1 ? videoRaw.slice(0, separator).trim() : "";
    const videoUrl = separator > -1 ? videoRaw.slice(separator + 3).trim() : "";

    return json({
      configured: true,
      source: "decapi",
      live: isLive ? {
        isLive: true,
        title: title || "i’m live right now!!",
        gameName: gameName || null,
        viewerCount: Number.isFinite(viewerCount) ? viewerCount : null,
        uptime,
        url: `https://www.twitch.tv/${CHANNEL}`,
      } : { isLive: false },
      video: videoUrl.startsWith("http") ? {
        id: videoUrl.split("/").filter(Boolean).at(-1),
        title: videoTitle || "latest stream",
        publishedAt: null,
        thumbnailUrl: null,
        url: videoUrl,
      } : null,
      schedule: scheduleResult.status === "fulfilled" ? scheduleResult.value : [],
    });
  } catch (error) {
    console.error("DecAPI Twitch error", error);
    return json({ configured: true, source: "decapi", live: null, video: null, schedule: [], error: "Twitch is taking a tiny nap." }, 502);
  }
};
