export {};
type Video = { title: string; url: string; thumbnailUrl: string; publishedAt: string };
type Stream = { title?: string; startTime: string; endTime?: string; category?: string | null; canceledUntil?: string | null };
type Twitch = { live: { isLive: boolean; title?: string; gameName?: string } | null; video: Video | null; schedule: Stream[]; scheduleAvailable?: boolean; error?: string };
const root = document.documentElement;
let controller: AbortController | undefined;
let generation = 0;
const accepted = () => root.dataset.privacyChoice === "accepted";
const text = (selector: string, value: string) => document.querySelectorAll(selector).forEach(node => { node.textContent = value; });
const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className = "", copy?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag); node.className = className;
  if (copy !== undefined) node.textContent = copy;
  return node;
};
const safeUrl = (raw: string, hosts: string[]) => {
  try { const url = new URL(raw); return url.protocol === "https:" && hosts.includes(url.hostname) ? url.href : ""; } catch { return ""; }
};
const state = (title: string, detail: string, mood = "wondering", privacy = false) => {
  const box = element("div", "media-state");
  const image = element("img");
  image.src = "/assets/emotions/" + mood + ".webp"; image.alt = ""; image.width = 100; image.height = 130;
  const copy = element("div");
  copy.append(element("h3", "", title), element("p", "", detail));
  if (privacy) {
    const button = element("button", "btn secondary", "privacy choices");
    button.type = "button"; button.dataset.openPrivacy = ""; copy.append(button);
  }
  box.append(image, copy); return box;
};
const playerState = (title: string, detail: string, mood: string, privacy = false) => {
  const frame = document.querySelector("[data-player-frame]");
  if (!frame) return;
  const box = state(title, detail, mood, privacy); box.className = "player-state";
  frame.replaceChildren(box);
};
const resetMedia = () => {
  text("[data-live-status]", "not loaded");
  document.querySelectorAll<HTMLElement>("[data-nav-live]").forEach(node => { node.hidden = true; });
  document.querySelectorAll(".is-live").forEach(node => node.classList.remove("is-live"));
  text("[data-stream-title]", "come watch me!");
  text("[data-stream-detail]", "games, chatting, and whatever happens in between.");
  playerState("Twitch is not loaded yet", "Allow optional media to check the stream.", "wondering", true);
  document.querySelector("[data-youtube-feed]")?.replaceChildren(state("the videos are one click away", "Allow optional media to see my latest uploads here.", "loading", true));
  document.querySelector("[data-schedule-list]")?.replaceChildren(state("the calendar is tucked away", "Allow optional media to load my Twitch schedule.", "loading", true));
  text("[data-vod-title]", "catch up on Twitch");
  text("[data-vod-detail]", "Allow optional media to find the latest VOD here.");
  document.querySelector("[data-vod-link]")?.setAttribute("href", "https://www.twitch.tv/mochikolive/videos");
};
const showSchedule = (streams: Stream[], failed = false) => {
  const list = document.querySelector("[data-schedule-list]");
  if (!list) return;
  const upcoming = streams.filter(stream => !stream.canceledUntil && Number.isFinite(Date.parse(stream.startTime)) && Date.parse(stream.endTime || stream.startTime) > Date.now());
  if (!upcoming.length) {
    list.replaceChildren(state(failed ? "the calendar didn’t load" : "nothing scheduled yet", "You can check the full schedule directly on Twitch.", "sad"));
    return;
  }
  list.replaceChildren(...upcoming.map(stream => {
    const article = element("article", "schedule-item");
    const date = new Date(stream.startTime);
    const time = element("time"); time.dateTime = stream.startTime;
    time.append(element("small", "", new Intl.DateTimeFormat(undefined, { month: "short" }).format(date)), element("strong", "", new Intl.DateTimeFormat(undefined, { day: "2-digit" }).format(date)));
    const copy = element("div");
    copy.append(element("h3", "", stream.title || "stream time!"), element("p", "", new Intl.DateTimeFormat(undefined, { weekday: "long", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date) + (stream.category ? " · " + stream.category : "")));
    article.append(time, copy); return article;
  }));
};
const renderTwitch = (data: Twitch) => {
  const live = data.live?.isLive;
  text("[data-live-status]", live === true ? "live now!" : live === false ? "offline for now" : "check Twitch");
  document.querySelectorAll<HTMLElement>("[data-nav-live]").forEach(node => { node.hidden = live !== true; });
  if (live) {
    document.querySelectorAll("[data-live-status]").forEach(node => node.classList.add("is-live"));
    text("[data-stream-title]", data.live?.title || "i’m live right now!");
    text("[data-stream-detail]", data.live?.gameName ? "playing " + data.live.gameName : "come say hi in chat.");
    const frame = document.querySelector("[data-player-frame]");
    if (frame) {
      const iframe = element("iframe");
      const url = new URL("https://player.twitch.tv/");
      url.search = new URLSearchParams({ channel: "mochikolive", parent: location.hostname, autoplay: "true", muted: "true" }).toString();
      iframe.src = url.href; iframe.title = "Mochiko’s live Twitch stream"; iframe.allow = "autoplay; fullscreen"; iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
    }
  } else if (live === false) {
    playerState("not live right now", "There are videos below, or catch up with the latest VOD.", "sad");
    text("[data-stream-title]", "see you next stream");
    text("[data-stream-detail]", "check the schedule to see what’s coming up.");
  } else {
    playerState("Twitch didn’t answer", "You can still open the channel directly.", "wondering");
  }
  const vod = data.video && safeUrl(data.video.url, ["www.twitch.tv", "twitch.tv"]);
  text("[data-vod-title]", vod ? data.video!.title : "catch up on Twitch");
  text("[data-vod-detail]", vod ? "the most recent stream recording." : "The latest recording is available on my channel.");
  document.querySelector("[data-vod-link]")?.setAttribute("href", vod || "https://www.twitch.tv/mochikolive/videos");
  showSchedule(data.schedule || [], Boolean(data.error) || data.scheduleAvailable === false);
};
const renderVideos = (videos: Video[]) => {
  const feed = document.querySelector("[data-youtube-feed]");
  if (!feed) return;
  const valid = videos.filter(video => safeUrl(video.url, ["www.youtube.com", "youtube.com", "youtu.be"])).slice(0, 4);
  if (!valid.length) {
    feed.replaceChildren(state("the feed is taking a break", "Use the YouTube link above to see my videos.", "sad"));
    return;
  }
  feed.replaceChildren(...valid.map(video => {
    const link = element("a", "card video-card"); link.href = video.url; link.target = "_blank"; link.rel = "noreferrer";
    const thumbnail = safeUrl(video.thumbnailUrl, ["i.ytimg.com", "img.youtube.com"]);
    const image = element("img"); image.src = thumbnail || "/assets/scenes/gaming-bedroom.webp"; image.alt = ""; image.width = 480; image.height = 270; image.loading = "lazy";
    image.addEventListener("error", () => { image.src = "/assets/scenes/gaming-bedroom.webp"; }, { once: true });
    const copy = element("div", "video-copy");
    const date = Date.parse(video.publishedAt);
    copy.append(element("span", "eyebrow", "YOUTUBE"), element("h3", "", video.title));
    if (Number.isFinite(date)) { const time = element("time", "", new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(date))); time.dateTime = video.publishedAt; copy.append(time); }
    link.append(image, copy); return link;
  }));
};
const loadMedia = () => {
  controller?.abort();
  const version = ++generation;
  if (!accepted()) { resetMedia(); return; }
  controller = new AbortController();
  const signal = controller.signal;
  const current = () => version === generation && accepted() && !signal.aborted;
  text("[data-live-status]", "checking Twitch…");
  playerState("checking the stream…", "one moment.", "loading");
  document.querySelector("[data-schedule-list]")?.replaceChildren(state("checking the calendar…", "times will follow your clock.", "loading"));
  const hasTwitch = document.querySelector("[data-live-status], [data-schedule-list], [data-vod-panel]");
  if (hasTwitch) fetch("/api/twitch", { signal }).then(async response => {
    if (!response.ok) throw new Error("Twitch unavailable");
    return await response.json() as Twitch;
  }).then(data => { if (current()) renderTwitch(data); }).catch(() => {
    if (current()) renderTwitch({ live: null, video: null, schedule: [], error: "unavailable" });
  });
  if (document.querySelector("[data-youtube-feed]")) {
    document.querySelector("[data-youtube-feed]")?.replaceChildren(state("getting the newest videos…", "one moment.", "loading"));
    fetch("/api/youtube", { signal }).then(async response => {
      if (!response.ok) throw new Error("YouTube unavailable");
      return await response.json() as { videos: Video[] };
    }).then(data => { if (current()) renderVideos(data.videos || []); }).catch(() => { if (current()) renderVideos([]); });
  }
};
text("[data-schedule-zone]", Intl.DateTimeFormat().resolvedOptions().timeZone || "your timezone");
window.addEventListener("mochiko:privacy-choice", loadMedia);
loadMedia();
