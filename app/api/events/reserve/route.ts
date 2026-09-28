import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection, getReservationsCollection } from "@/src/models/event";
import { getSession } from "@/src/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { eventId, customerName, customerEmail, customerPhone, seatsCount = 1, notes } = body;

    if (!eventId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Event ID, full name, and email address are required to book a reservation." },
        { status: 400 }
      );
    }

    const requestedSeats = Math.max(Number(seatsCount) || 1, 1);
    const eventsCollection = await getEventsCollection();

    let eventDoc;
    try {
      eventDoc = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    } catch {
      eventDoc = await eventsCollection.findOne({ title: eventId });
    }

    if (!eventDoc) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const availableSeats = eventDoc.capacity - (eventDoc.reservedSeats || 0);
    if (requestedSeats > availableSeats) {
      return NextResponse.json(
        {
          error: `Sorry, only ${availableSeats} seat(s) remain available for this event.`,
        },
        { status: 400 }
      );
    }

    const reservationsCollection = await getReservationsCollection();
    const reservationCode = `RES-${Date.now().toString().slice(-6)}`;

    const reservationDoc = {
      reservationCode,
      eventId: eventDoc._id!.toString(),
      eventTitle: eventDoc.title,
      eventDate: eventDoc.date,
      eventVenue: eventDoc.venue,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || "",
      seatsCount: requestedSeats,
      notes: notes?.trim() || "",
      userId: session?.userId || null,
      status: "confirmed" as const,
      createdAt: new Date(),
    };

    await reservationsCollection.insertOne(reservationDoc);

    // Increment reservedSeats on event
    await eventsCollection.updateOne(
      { _id: eventDoc._id },
      { $inc: { reservedSeats: requestedSeats }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `Reservation confirmed for ${requestedSeats} seat(s).`,
      reservationCode,
      reservation: reservationDoc,
    });
  } catch (error) {
    console.error("Event reservation error:", error);
    return NextResponse.json({ error: "Failed to reserve seat" }, { status: 500 });
  }
}
