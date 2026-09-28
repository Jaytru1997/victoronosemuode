import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getEventsCollection, getReservationsCollection } from "@/src/models/event";
import { getSession } from "@/src/lib/auth";

/**
 * GET /api/events/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const collection = await getEventsCollection();
    const event = await collection.findOne({ _id: new ObjectId(id) });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json({ error: "Failed to load event" }, { status: 500 });
  }
}

/**
 * PUT /api/events/[id]
 * Only admin or manager can update events.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      theme,
      date,
      time,
      venue,
      location,
      clientRole,
      description,
      capacity,
      category,
      posterImage,
      status,
    } = body;

    const collection = await getEventsCollection();
    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateDoc.title = title.trim();
    if (theme !== undefined) updateDoc.theme = theme.trim();
    if (date !== undefined) updateDoc.date = date.trim();
    if (time !== undefined) updateDoc.time = time.trim();
    if (venue !== undefined) updateDoc.venue = venue.trim();
    if (location !== undefined) updateDoc.location = location.trim();
    if (clientRole !== undefined) updateDoc.clientRole = clientRole.trim();
    if (description !== undefined) updateDoc.description = description.trim();
    if (capacity !== undefined) updateDoc.capacity = Number(capacity);
    if (category !== undefined) updateDoc.category = category;
    if (posterImage !== undefined) updateDoc.posterImage = posterImage;
    if (status !== undefined) updateDoc.status = status;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event updated successfully" });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

/**
 * DELETE /api/events/[id]
 * Only admin or manager can delete events.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const collection = await getEventsCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Also clean up reservations for this event
    const reservationsCol = await getReservationsCollection();
    await reservationsCol.deleteMany({ eventId: id });

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
