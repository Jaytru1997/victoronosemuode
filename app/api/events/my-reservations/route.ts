import { NextRequest, NextResponse } from "next/server";
import { getReservationsCollection } from "@/src/models/event";
import { getSession } from "@/src/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");

    const reservationsCollection = await getReservationsCollection();

    // If admin, they can view all reservations or filter
    if (session && (session.role === "admin" || session.role === "manager")) {
      const query: Record<string, unknown> = {};
      if (emailParam) {
        query.customerEmail = emailParam.toLowerCase();
      }
      const reservations = await reservationsCollection.find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ reservations });
    }

    const targetEmail = session?.email || emailParam;
    if (!targetEmail) {
      return NextResponse.json({ reservations: [] });
    }

    const query = {
      $or: [
        { customerEmail: targetEmail.toLowerCase() },
        ...(session?.userId ? [{ userId: session.userId }] : []),
      ],
    };

    const reservations = await reservationsCollection.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}
