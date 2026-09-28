/**
 * ICS (iCalendar) file generation utility.
 *
 * Generates RFC 5545 compliant .ics content for meeting export.
 */

export interface ICSEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
  startTime: Date;
  endTime: Date;
  organizer?: { name: string; email: string };
  attendee?: { name: string; email: string };
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
  createdAt?: Date;
}

/**
 * Escape special characters for iCalendar text values.
 * Per RFC 5545 §3.3.11
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Format a Date to iCalendar UTC datetime string: YYYYMMDDTHHmmssZ
 */
function formatDateUTC(date: Date): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate a complete .ics file string from a meeting event.
 */
export function generateICS(event: ICSEvent): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VictorOnosemuode//Meeting Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatDateUTC(new Date())}`,
    `DTSTART:${formatDateUTC(event.startTime)}`,
    `DTEND:${formatDateUTC(event.endTime)}`,
    `SUMMARY:${escapeICS(event.summary)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  if (event.organizer) {
    lines.push(
      `ORGANIZER;CN=${escapeICS(event.organizer.name)}:mailto:${event.organizer.email}`
    );
  }

  if (event.attendee) {
    lines.push(
      `ATTENDEE;CN=${escapeICS(event.attendee.name)};RSVP=TRUE:mailto:${event.attendee.email}`
    );
  }

  const statusMap: Record<string, string> = {
    CONFIRMED: "CONFIRMED",
    TENTATIVE: "TENTATIVE",
    CANCELLED: "CANCELLED",
  };
  lines.push(`STATUS:${statusMap[event.status || "CONFIRMED"] || "CONFIRMED"}`);

  if (event.createdAt) {
    lines.push(`CREATED:${formatDateUTC(event.createdAt)}`);
  }

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Generate a Google Calendar URL for the event.
 */
export function generateGoogleCalendarURL(event: ICSEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    dates: `${formatDateUTC(event.startTime).replace("Z", "")}Z/${formatDateUTC(event.endTime).replace("Z", "")}Z`,
  });

  if (event.description) params.set("details", event.description);
  if (event.location) params.set("location", event.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook Web URL for the event.
 */
export function generateOutlookURL(event: ICSEvent): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.summary,
    staRtdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
  });

  if (event.description) params.set("body", event.description);
  if (event.location) params.set("location", event.location);

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
