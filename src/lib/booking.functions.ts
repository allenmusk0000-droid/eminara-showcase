import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

/** Calendar the meetings live on. Falls back to the connected account's primary calendar. */
export const OWNER_EMAIL = "akshitpundeer21@gmail.com";

export const SLOT_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:30",
];

const SLOT_MINUTES = 30;

function headers() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["GOOGLE_CALENDAR_API_KEY"];
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!connKey) throw new Error("GOOGLE_CALENDAR_API_KEY is not configured");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connKey,
    "Content-Type": "application/json",
  };
}

/** Build a UTC Date from a local date string + HH:mm in a given IANA timezone. */
function zonedToUtc(dateISO: string, time: string, timeZone: string): Date {
  const [h, m] = time.split(":").map(Number);
  const [y, mo, d] = dateISO.split("-").map(Number);
  // Guess UTC, then correct by the zone offset at that instant.
  const guess = Date.UTC(y!, mo! - 1, d!, h!, m!);
  const offset =
    new Date(
      new Date(guess).toLocaleString("en-US", { timeZone: "UTC" })
    ).getTime() -
    new Date(
      new Date(guess).toLocaleString("en-US", { timeZone })
    ).getTime();
  return new Date(guess + offset);
}

async function resolveCalendar(): Promise<{ id: string; timeZone: string }> {
  const tryIds = [OWNER_EMAIL, "primary"];
  for (const id of tryIds) {
    const res = await fetch(`${GATEWAY}/calendars/${encodeURIComponent(id)}`, {
      headers: headers(),
    });
    if (res.ok) {
      const body = (await res.json()) as { id: string; timeZone?: string };
      return { id: body.id ?? id, timeZone: body.timeZone ?? "UTC" };
    }
    if (res.status !== 404 && res.status !== 403) {
      const text = await res.text();
      throw new Error(`Calendar lookup failed [${res.status}]: ${text}`);
    }
  }
  throw new Error("No accessible Google Calendar found for this connection");
}

export const getAvailability = createServerFn({ method: "POST" })
  .inputValidator((data: { date: string }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error("Invalid date");
    return data;
  })
  .handler(async ({ data }) => {
    const cal = await resolveCalendar();
    const dayStart = zonedToUtc(data.date, "00:00", cal.timeZone);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const res = await fetch(`${GATEWAY}/freeBusy`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        timeZone: cal.timeZone,
        items: [{ id: cal.id }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Availability lookup failed [${res.status}]: ${text}`);
    }
    const body = (await res.json()) as {
      calendars?: Record<string, { busy?: { start: string; end: string }[] }>;
    };
    const busy = body.calendars?.[cal.id]?.busy ?? [];
    const now = Date.now();

    const slots = SLOT_TIMES.map((time) => {
      const start = zonedToUtc(data.date, time, cal.timeZone).getTime();
      const end = start + SLOT_MINUTES * 60 * 1000;
      const overlaps = busy.some((b) => {
        const bs = new Date(b.start).getTime();
        const be = new Date(b.end).getTime();
        return start < be && end > bs;
      });
      return { time, available: !overlaps && start > now };
    });

    return { timeZone: cal.timeZone, slots };
  });

export const bookSlot = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      date: string;
      time: string;
      name: string;
      email: string;
      notes?: string;
    }) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error("Invalid date");
      if (!SLOT_TIMES.includes(data.time)) throw new Error("Invalid time slot");
      if (!data.name?.trim()) throw new Error("Name is required");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email ?? ""))
        throw new Error("Valid email is required");
      return {
        date: data.date,
        time: data.time,
        name: data.name.trim().slice(0, 120),
        email: data.email.trim().slice(0, 200),
        notes: (data.notes ?? "").trim().slice(0, 1000),
      };
    }
  )
  .handler(async ({ data }) => {
    const cal = await resolveCalendar();
    const start = zonedToUtc(data.date, data.time, cal.timeZone);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);

    // Re-check availability so two people can't grab the same slot.
    const fb = await fetch(`${GATEWAY}/freeBusy`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: cal.id }],
      }),
    });
    if (fb.ok) {
      const fbBody = (await fb.json()) as {
        calendars?: Record<string, { busy?: unknown[] }>;
      };
      if ((fbBody.calendars?.[cal.id]?.busy ?? []).length > 0) {
        return { ok: false as const, reason: "taken" as const };
      }
    }

    const res = await fetch(
      `${GATEWAY}/calendars/${encodeURIComponent(cal.id)}/events?sendUpdates=all`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          summary: `EmiNara AI strategy call — ${data.name}`,
          description: [
            `Name: ${data.name}`,
            `Email: ${data.email}`,
            data.notes ? `Notes: ${data.notes}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
          start: { dateTime: start.toISOString(), timeZone: cal.timeZone },
          end: { dateTime: end.toISOString(), timeZone: cal.timeZone },
          attendees: [{ email: data.email }, { email: OWNER_EMAIL }],
        }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Booking failed [${res.status}]: ${text}`);
    }
    return { ok: true as const };
  });
