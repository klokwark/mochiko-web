import type { APIRoute } from "astro";

export const prerender = false;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  },
});

export const GET: APIRoute = async () => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return json({ configured: false, live: null, video: null, schedule: [] });
  }

  try {
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenResponse.ok) throw new Error("Unable to authenticate with Twitch");
    const tokenData = await tokenResponse.json();
    const headers = {
      "Client-Id": clientId,
      Authorization: `Bearer ${tokenData.access_token}`,
    };

    const userResponse = await fetch("https://api.twitch.tv/helix/users?login=mochikolive", { headers });
    if (!userResponse.ok) throw new Error("Unable to find the Twitch channel");
    const userData = await userResponse.json();
    const user = userData.data?.[0];
    if (!user) return json({ configured: true, live: null, video: null, schedule: [] });

    const [streamResponse, videosResponse, scheduleResponse] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/streams?user_id=${user.id}`, { headers }),
      fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&first=1&type=archive`, { headers }),
      fetch(`https://api.twitch.tv/helix/schedule?broadcaster_id=${user.id}&first=8`, { headers }),
    ]);

    const streamData = streamResponse.ok ? await streamResponse.json() : { data: [] };
    const videosData = videosResponse.ok ? await videosResponse.json() : { data: [] };
    const scheduleData = scheduleResponse.ok ? await scheduleResponse.json() : { data: { segments: [] } };
    const stream = streamData.data?.[0];
    const video = videosData.data?.[0];

    return json({
      configured: true,
      live: stream ? {
        isLive: true,
        title: stream.title,
        gameName: stream.game_name,
        viewerCount: stream.viewer_count,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url?.replace("{width}", "1280").replace("{height}", "720"),
        url: "https://www.twitch.tv/mochikolive",
      } : { isLive: false },
      video: video ? {
        id: video.id,
        title: video.title,
        duration: video.duration,
        publishedAt: video.published_at,
        thumbnailUrl: video.thumbnail_url?.replace("%{width}", "640").replace("%{height}", "360"),
        url: video.url,
      } : null,
      schedule: (scheduleData.data?.segments ?? []).map((segment: any) => ({
        id: segment.id,
        title: segment.title,
        startTime: segment.start_time,
        endTime: segment.end_time,
        canceledUntil: segment.canceled_until,
        category: segment.category?.name ?? null,
      })),
    });
  } catch (error) {
    console.error("Twitch API error", error);
    return json({ configured: true, live: null, video: null, schedule: [], error: "Twitch is taking a tiny nap." }, 502);
  }
};
