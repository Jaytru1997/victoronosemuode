import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection, ensureDefaultEventsSeeded } from "@/src/models/event";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const collection = await getEventsCollection();
    await ensureDefaultEventsSeeded();

    const events = await collection.find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, theme, date, time, venue, location, clientRole, description, capacity, category, posterImage } = body;

    if (!title || !date || !venue) {
      return NextResponse.json({ error: "Title, date, and venue are required." }, { status: 400 });
    }

    const collection = await getEventsCollection();
    const newEvent = {
      title: title.trim(),
      theme: theme?.trim() || "",
      date: date.trim(),
      time: time?.trim() || "10:00 AM WAT",
      venue: venue.trim(),
      location: location?.trim() || venue.trim(),
      clientRole: clientRole?.trim() || "Attendee",
      description: description?.trim() || "",
      capacity: Number(capacity) || 100,
      reservedSeats: 0,
      category: category?.trim() || "Event",
      posterImage: posterImage?.trim() || "/annual-vestry-meeting-poster.png",
      status: "upcoming" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newEvent);
    return NextResponse.json({ success: true, eventId: result.insertedId.toString() });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
