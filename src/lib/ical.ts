export type CalendarEvent = {
  title: string;
  startTime: string;
  endTime: string;
  category: string | null;
  canceledUntil: null;
};

type LocalTime = { year: number; month: number; day: number; hour: number; minute: number; second: number; zone: string | null; utc: boolean };

const DAY = 86_400_000;
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MAX_DAYS = 5000;

const unfold = (input: string) => input.replace(/\r?\n[ \t]/g, "");
const unescape = (input: string) => input.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");

const formatters = new Map<string, Intl.DateTimeFormat>();
const zoneFormatter = (zone: string) => {
  let formatter = formatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    });
    formatters.set(zone, formatter);
  }
  return formatter;
};

const parseTime = (params: string, value: string): LocalTime | null => {
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/);
  if (!match) return null;
  const [, year, month, day, hour = "0", minute = "0", second = "0", utc] = match;
  const zone = params.match(/TZID=([^:;]+)/)?.[1]?.replace(/^\/+/, "") || null;
  return { year: +year, month: +month, day: +day, hour: +hour, minute: +minute, second: +second, zone, utc: utc === "Z" };
};

const toInstant = (time: LocalTime) => {
  const target = Date.UTC(time.year, time.month - 1, time.day, time.hour, time.minute, time.second);
  if (time.utc || !time.zone) return target;
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = zoneFormatter(time.zone);
  } catch {
    return target;
  }
  let instant = target;
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    instant += target - shown;
  }
  return instant;
};

const splitProperty = (line: string) => {
  const colon = line.indexOf(":");
  return colon === -1 ? { name: line, params: "", value: "" } : { name: line.slice(0, colon).split(";")[0], params: line.slice(0, colon), value: line.slice(colon + 1) };
};

const expand = (start: LocalTime, rrule: string, skip: Set<number>, from: number, to: number) => {
  const startInstant = toInstant(start);
  const rule = Object.fromEntries(rrule.split(";").filter(Boolean).map((part) => part.split("=")));
  if (rule.FREQ !== "WEEKLY") return startInstant >= from && startInstant <= to && !skip.has(startInstant) ? [startInstant] : [];

  const interval = Math.max(1, Number.parseInt(rule.INTERVAL ?? "1", 10) || 1);
  const count = rule.COUNT ? Number.parseInt(rule.COUNT, 10) : Infinity;
  const untilTime = rule.UNTIL ? parseTime(start.zone ? `TZID=${start.zone}` : "", rule.UNTIL) : null;
  const until = untilTime ? toInstant(untilTime) : Infinity;
  const anchor = Date.UTC(start.year, start.month - 1, start.day);
  const anchorWeekday = new Date(anchor).getUTCDay();
  const weekStart = anchor - ((anchorWeekday + 6) % 7) * DAY;
  const days = (rule.BYDAY ? rule.BYDAY.split(",").map((code: string) => WEEKDAYS.indexOf(code.slice(-2))) : [anchorWeekday]).filter((index: number) => index >= 0);

  const found: number[] = [];
  let seen = 0;
  for (let offset = 0; offset < MAX_DAYS; offset += 1) {
    const day = anchor + offset * DAY;
    if (day > to + 2 * DAY) break;
    if (!days.includes(new Date(day).getUTCDay())) continue;
    if (Math.floor((day - weekStart) / (7 * DAY)) % interval !== 0) continue;
    if (!Number.isFinite(count) && day < from - 2 * DAY) continue;
    const date = new Date(day);
    const instant = toInstant({ ...start, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
    if (instant < startInstant) continue;
    seen += 1;
    if (seen > count || instant > until) break;
    if (instant >= from && instant <= to && !skip.has(instant)) found.push(instant);
  }
  return found;
};

export const upcomingFromCalendar = (source: string, now = Date.now(), { pastMs = 60 * 60 * 1000, aheadMs = 28 * DAY, limit = 6 } = {}) => {
  const from = now - pastMs;
  const to = now + aheadMs;
  const events = unfold(source).split("BEGIN:VEVENT").slice(1).map((block) => {
    const props = block.split("END:VEVENT")[0].split(/\r?\n/).filter(Boolean).map(splitProperty);
    const get = (name: string) => props.find((prop) => prop.name === name);
    const all = (name: string) => props.filter((prop) => prop.name === name);
    return { get, all };
  });

  const overridden = new Map<string, Set<number>>();
  for (const event of events) {
    const uid = event.get("UID")?.value.trim();
    const recurrence = event.get("RECURRENCE-ID");
    const time = recurrence && parseTime(recurrence.params, recurrence.value);
    if (!uid || !time) continue;
    if (!overridden.has(uid)) overridden.set(uid, new Set());
    overridden.get(uid)!.add(toInstant(time));
  }

  const results: { start: number; event: CalendarEvent }[] = [];
  for (const event of events) {
    if (event.get("STATUS")?.value.trim().toUpperCase() === "CANCELLED") continue;
    const startProp = event.get("DTSTART");
    const start = startProp && parseTime(startProp.params, startProp.value);
    if (!start) continue;
    const endProp = event.get("DTEND");
    const end = endProp && parseTime(endProp.params, endProp.value);
    const duration = end ? toInstant(end) - toInstant(start) : 0;

    const skip = new Set<number>();
    for (const exdate of event.all("EXDATE")) {
      for (const value of exdate.value.split(",")) {
        const time = parseTime(exdate.params, value);
        if (time) skip.add(toInstant(time));
      }
    }
    const uid = event.get("UID")?.value.trim();
    const isOverride = Boolean(event.get("RECURRENCE-ID"));
    if (uid && !isOverride) overridden.get(uid)?.forEach((instant) => skip.add(instant));

    const rrule = isOverride ? "" : event.get("RRULE")?.value.trim() ?? "";
    const title = unescape(event.get("SUMMARY")?.value.trim() ?? "") || "streamzeit!";
    const category = unescape(event.get("CATEGORIES")?.value.trim() ?? "") || null;
    for (const instant of expand(start, rrule, skip, from, to)) {
      results.push({
        start: instant,
        event: {
          title,
          startTime: new Date(instant).toISOString(),
          endTime: duration > 0 ? new Date(instant + duration).toISOString() : "",
          category,
          canceledUntil: null,
        },
      });
    }
  }

  return results.sort((a, b) => a.start - b.start).slice(0, limit).map((result) => result.event);
};
