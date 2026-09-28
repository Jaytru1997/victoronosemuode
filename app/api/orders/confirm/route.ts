import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { getDb } from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or manager privileges required." },
        { status: 403 }
      );
    }

    const { orderId, action } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const db = await getDb();
    const ordersCollection = db.collection("orders");
    const usersCollection = db.collection("users");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(orderId);
    } catch {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await ordersCollection.findOne({ _id: objectId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "reject") {
      await ordersCollection.updateOne(
        { _id: objectId },
        { $set: { status: "rejected", updatedAt: new Date(), confirmedBy: session.email } }
      );
      return NextResponse.json({
        success: true,
        message: "Payment marked as rejected.",
      });
    }

    // Default action: Confirm payment
    await ordersCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          status: "confirmed",
          confirmedAt: new Date(),
          confirmedBy: session.email,
          updatedAt: new Date(),
        },
      }
    );

    // Extract book titles from items
    const purchasedTitles: string[] = (order.items || []).map((i: { title: string }) => i.title);

    // Add books to the user's purchasedItems by email or userId
    if (purchasedTitles.length > 0) {
      const userFilter = order.userId
        ? { _id: new ObjectId(order.userId) }
        : { email: order.customerEmail.toLowerCase() };

      await usersCollection.updateOne(
        userFilter,
        {
          $addToSet: { purchasedItems: { $each: purchasedTitles } },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment for order ${order.orderNumber} confirmed. ${purchasedTitles.length} resource(s) unlocked for ${order.customerEmail}.`,
    });
  } catch (error) {
    console.error("Failed to confirm order payment:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
