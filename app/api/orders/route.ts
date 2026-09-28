import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { getDb } from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");
    const statusParam = searchParams.get("status");

    const db = await getDb();
    const ordersCollection = db.collection("orders");

    // If admin or manager requesting all or filtered orders
    if (session && (session.role === "admin" || session.role === "manager")) {
      const query: Record<string, unknown> = {};
      if (statusParam) {
        query.status = statusParam;
      }
      if (emailParam) {
        query.customerEmail = emailParam.toLowerCase();
      }
      const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ orders });
    }

    // For regular users, find by session userId or email
    const userEmail = session?.email || emailParam;
    if (!userEmail) {
      return NextResponse.json({ orders: [] });
    }

    const query = {
      $or: [
        { customerEmail: userEmail.toLowerCase() },
        ...(session?.userId ? [{ userId: session.userId }] : []),
      ],
    };

    const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      notes,
      orderNumber,
      currency = "NGN",
      senderDetails = "",
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Customer name and email are required for checkout." },
        { status: 400 }
      );
    }

    // Validate 5-part address if provided as object
    const structuredAddress =
      typeof deliveryAddress === "object" && deliveryAddress !== null
        ? {
            country: deliveryAddress.country || "Nigeria",
            state: deliveryAddress.state || "",
            city: deliveryAddress.city || "",
            postalCode: deliveryAddress.postalCode || "",
            street: deliveryAddress.street || "",
          }
        : {
            country: "Nigeria",
            state: "",
            city: "",
            postalCode: "",
            street: typeof deliveryAddress === "string" ? deliveryAddress : "",
          };

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * (item.quantity || 1),
      0
    );

    const db = await getDb();
    const ordersCollection = db.collection("orders");

    const orderDoc = {
      orderNumber: orderNumber || `VO-${Date.now().toString().slice(-6)}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || "",
      deliveryAddress: structuredAddress,
      notes: notes?.trim() || "",
      items,
      totalAmount,
      currency,
      paymentMethod: "bank_transfer",
      senderDetails: senderDetails.trim(),
      // Payment status starts as "payment_submitted" (pending admin confirmation)
      status: "payment_submitted",
      userId: session?.userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(orderDoc);

    // Notice: Per requirements, books are NOT unlocked immediately.
    // They are added to the user's purchased books ONLY when an admin confirms the payment.

    return NextResponse.json({
      success: true,
      message: "Payment submitted. Awaiting admin confirmation.",
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
