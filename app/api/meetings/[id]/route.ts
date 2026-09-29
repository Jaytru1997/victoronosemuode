import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession, hasRole } from "@/src/lib/auth";
import {
  getMeetingById,
  updateMeeting,
  cancelMeeting,
  findOverlappingMeetings,
} from "@/src/models/meeting";
import { generateICS } from "@/src/lib/ics";

/**
 * GET /api/meetings/:id
 *
 * Get meeting details. User must be the organizer or client.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    const meeting = await getMeetingById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Authorization: only organizer, client, or admin can see this meeting
    const userId = session.userId;
    const isOrganizer = meeting.organizer.toString() === userId;
    const isClient = meeting.client.toString() === userId;
    const isAdmin = session.role === "admin";

    if (!isOrganizer && !isClient && !isAdmin) {
      return NextResponse.json({ error: "You do not have access to this meeting." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      meeting: {
        ...meeting,
        _id: meeting._id!.toString(),
        organizer: meeting.organizer.toString(),
        client: meeting.client.toString(),
      },
    });
  } catch (error) {
    console.error("Get meeting error:", error);
    return NextResponse.json({ error: "Failed to fetch meeting" }, { status: 500 });
  }
}

/**
 * PUT /api/meetings/:id
 *
 * Update / reschedule a meeting. Only the organizer or admin can modify.
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    const meeting = await getMeetingById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Only organizer or admin can reschedule
    const isOrganizer = meeting.organizer.toString() === session.userId;
    const isAdmin = session.role === "admin";
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "Only the meeting organizer or an admin can modify this meeting." },
        { status: 403 }
      );
    }

    if (meeting.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot modify a cancelled meeting." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.title) {
      if (body.title.trim().length > 200) {
        return NextResponse.json({ error: "Title must be under 200 characters." }, { status: 400 });
      }
      updates.title = body.title.trim();
    }
    if (body.description !== undefined) updates.description = body.description?.trim() || "";
    if (body.location !== undefined) updates.location = body.location?.trim() || "";
    if (body.meetingUrl !== undefined) updates.meetingUrl = body.meetingUrl?.trim() || "";
    if (body.notes !== undefined) updates.notes = body.notes?.trim() || "";

    // Handle rescheduling (date/time change)
    if (body.date && body.startTime && body.duration) {
      const parsedDuration = parseInt(String(body.duration), 10);
      if (!parsedDuration || parsedDuration < 5 || parsedDuration > 480) {
        return NextResponse.json(
          { error: "Duration must be between 5 and 480 minutes." },
          { status: 400 }
        );
      }

      const startISO = new Date(`${body.date}T${body.startTime}:00`);
      if (isNaN(startISO.getTime())) {
        return NextResponse.json({ error: "Invalid date or time format." }, { status: 400 });
      }
      if (startISO.getTime() < Date.now() - 60_000) {
        return NextResponse.json(
          { error: "Cannot reschedule to a time in the past." },
          { status: 400 }
        );
      }

      const endISO = new Date(startISO.getTime() + parsedDuration * 60_000);

      // Double-booking check (exclude current meeting)
      const overlapping = await findOverlappingMeetings(
        meeting.organizer,
        startISO,
        endISO,
        id
      );
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

      updates.startTime = startISO;
      updates.endTime = endISO;
      updates.duration = parsedDuration;
      updates.status = "rescheduled";
      if (body.timezone) updates.timezone = body.timezone;
    }

    await updateMeeting(id, updates);

    return NextResponse.json({
      success: true,
      message: updates.status === "rescheduled"
        ? "Meeting rescheduled successfully."
        : "Meeting updated successfully.",
    });
  } catch (error) {
    console.error("Update meeting error:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meetings/:id
 *
 * Cancel a meeting. Sets status to "cancelled".
 * Admin can also hard-delete via ?hard=true query param.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    const meeting = await getMeetingById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const isOrganizer = meeting.organizer.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "Only the meeting organizer or an admin can cancel this meeting." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = (body as { reason?: string }).reason || "";

    await cancelMeeting(id, reason);

    return NextResponse.json({
      success: true,
      message: "Meeting cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel meeting error:", error);
    return NextResponse.json(
      { error: "Failed to cancel meeting" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meetings/:id
 *
 * Admin/manager: approve or reject a pending meeting by updating its status.
 * Supported body: { status: "scheduled" | "cancelled", cancellationReason?: string }
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin or manager can approve/reject
    if (!hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json({ error: "Only admins or managers can approve or decline meetings." }, { status: 403 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    const meeting = await getMeetingById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, cancellationReason } = body as {
      status: "scheduled" | "cancelled";
      cancellationReason?: string;
    };

    if (!["scheduled", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'scheduled' (approve) or 'cancelled' (decline)." }, { status: 400 });
    }

    await updateMeeting(id, {
      status,
      ...(cancellationReason ? { cancellationReason } : {}),
    });

    return NextResponse.json({
      success: true,
      message: status === "scheduled" ? "Meeting approved and confirmed." : "Meeting declined.",
    });
  } catch (error) {
    console.error("PATCH meeting error:", error);
    return NextResponse.json({ error: "Failed to update meeting status" }, { status: 500 });
  }
}
