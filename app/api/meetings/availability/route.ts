import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { getBookedSlots } from "@/src/models/meeting";

/**
 * GET /api/meetings/availability?date=2026-09-30&organizerId=<optional>
 *
 * Returns booked time slots for the given date.
 * If organizerId is omitted, uses the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "date query parameter is required (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Use the authenticated user as the organizer for availability checking
    const organizerId = searchParams.get("organizerId") || session.userId;

    const booked = await getBookedSlots(organizerId, date);

    return NextResponse.json({
      success: true,
      date: dateParam,
      bookedSlots: booked.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.title,
      })),
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
