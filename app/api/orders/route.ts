import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { getDb } from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { items, customerName, customerEmail, customerPhone, deliveryAddress, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Customer name and email are required for checkout." },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * (item.quantity || 1),
      0
    );

    const db = await getDb();
    const ordersCollection = db.collection("orders");

    const orderDoc = {
      orderNumber: `VO-${Date.now().toString().slice(-6)}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || "",
      deliveryAddress: deliveryAddress?.trim() || "",
      notes: notes?.trim() || "",
      items,
      totalAmount,
      currency: "NGN",
      status: "pending_fulfilment",
      userId: session?.userId || null,
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(orderDoc);

    // If user is authenticated, add purchased items to their profile
    if (session?.userId) {
      try {
        const usersCollection = db.collection("users");
        const purchasedTitles = items.map((i: { title: string }) => i.title);
        await usersCollection.updateOne(
          { _id: new ObjectId(session.userId) },
          { $addToSet: { purchasedItems: { $each: purchasedTitles } } }
        );
      } catch (err) {
        console.error("Failed to update user purchasedItems:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: result.insertedId.toString(),
      orderNumber: orderDoc.orderNumber,
    });
  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
