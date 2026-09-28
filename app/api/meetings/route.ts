import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession, hasRole } from "@/src/lib/auth";
import {
  createMeeting,
  getMeetingsForUser,
  findOverlappingMeetings,
  ensureMeetingIndexes,
} from "@/src/models/meeting";
import { findUserById, findUserByEmail, findAdminUser } from "@/src/models/user";

/**
 * GET /api/meetings
 *
 * Returns meetings for the authenticated user.
 * Optional query params: from, to, status
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");

    const options: {
      from?: Date;
      to?: Date;
      status?: "pending" | "scheduled" | "completed" | "cancelled" | "rescheduled";
    } = {};

    if (from) options.from = new Date(from);
    if (to) options.to = new Date(to);
    if (status && ["pending", "scheduled", "completed", "cancelled", "rescheduled"].includes(status)) {
      options.status = status as "pending" | "scheduled" | "completed" | "cancelled" | "rescheduled";
    }

    const meetings = await getMeetingsForUser(session.userId, options);

    // Serialise ObjectIds for JSON
    const serialised = meetings.map((m) => ({
      ...m,
      _id: m._id!.toString(),
      organizer: m.organizer.toString(),
      client: m.client.toString(),
    }));

    return NextResponse.json({ success: true, meetings: serialised });
  } catch (error) {
    console.error("Fetch meetings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meetings
 *
 * Create a new meeting.
 * Accessible to admins, managers, and authenticated users booking consultations.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      clientId,
      clientEmail: clientEmailInput,
      date,
      startTime,
      duration,
      timezone,
      location,
      meetingUrl,
      notes,
    } = body;

    // ── Validation ──
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Meeting title is required." }, { status: 400 });
    }
    if (title.trim().length > 200) {
      return NextResponse.json({ error: "Title must be under 200 characters." }, { status: 400 });
    }
    if (!date || !startTime) {
      return NextResponse.json({ error: "Date and start time are required." }, { status: 400 });
    }
    const parsedDuration = parseInt(String(duration), 10);
    if (!parsedDuration || parsedDuration < 5 || parsedDuration > 480) {
      return NextResponse.json(
        { error: "Duration must be between 5 and 480 minutes." },
        { status: 400 }
      );
    }

    // ── Resolve organizer and client ──
    let organizerOid: ObjectId;
    let clientOid: ObjectId;
    let clientName: string;
    let clientEmail: string;

    if (session.role === "admin" || session.role === "manager") {
      organizerOid = new ObjectId(session.userId);
      let clientUser;
      if (clientId) {
        clientUser = await findUserById(clientId);
      } else if (clientEmailInput) {
        clientUser = await findUserByEmail(clientEmailInput);
      }
      if (!clientUser) {
        return NextResponse.json(
          { error: "Client not found. Please select a valid client." },
          { status: 400 }
        );
      }
      clientOid = clientUser._id!;
      clientName = clientUser.name || clientUser.email;
      clientEmail = clientUser.email;
    } else {
      // Regular user booking a consultation meeting
      const adminUser = await findAdminUser();
      organizerOid = adminUser?._id ? adminUser._id : new ObjectId(session.userId);
      const currentUser = await findUserById(session.userId);
      if (!currentUser) {
        return NextResponse.json({ error: "User session invalid." }, { status: 401 });
      }
      clientOid = currentUser._id!;
      clientName = currentUser.name || currentUser.email;
      clientEmail = currentUser.email;
    }

    // ── Build timestamps ──
    const tz = timezone || "Africa/Lagos";
    const startISO = new Date(`${date}T${startTime}:00`);
    if (isNaN(startISO.getTime())) {
      return NextResponse.json({ error: "Invalid date or time format." }, { status: 400 });
    }

    // Prevent scheduling in the past
    if (startISO.getTime() < Date.now() - 60_000) {
      return NextResponse.json(
        { error: "Cannot schedule a meeting in the past." },
        { status: 400 }
      );
    }

    const endISO = new Date(startISO.getTime() + parsedDuration * 60_000);

    // ── Double-booking check ──
    const overlapping = await findOverlappingMeetings(organizerOid, startISO, endISO);
    if (overlapping.length > 0) {
      return NextResponse.json(
        {
          error: "That time slot is already booked. Please choose a different time.",
          conflicts: overlapping.map((o) => ({
            title: o.title,
            startTime: o.startTime,
            endTime: o.endTime,
          })),
        },
        { status: 409 }
      );
    }

    // ── Ensure indexes on first create ──
    await ensureMeetingIndexes();

    const meetingId = await createMeeting({
      title: title.trim(),
      description: description?.trim() || undefined,
      organizer: organizerOid,
      client: clientOid,
      clientName,
      clientEmail,
      startTime: startISO,
      endTime: endISO,
      timezone: tz,
      duration: parsedDuration,
      location: location?.trim() || "Virtual / Google Meet",
      meetingUrl: meetingUrl?.trim() || undefined,
      notes: notes?.trim() || undefined,
      status: session.role === "admin" || session.role === "manager" ? "scheduled" : "pending",
    });

    return NextResponse.json({
      success: true,
      message:
        session.role === "admin" || session.role === "manager"
          ? "Meeting scheduled successfully."
          : "Meeting request submitted. Awaiting admin confirmation.",
      meetingId: meetingId.toString(),
      status: session.role === "admin" || session.role === "manager" ? "scheduled" : "pending",
    });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json(
      { error: "Unable to schedule the meeting. Please try again." },
      { status: 500 }
    );
  }
}
