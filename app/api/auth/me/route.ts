import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { findUserById } from "@/src/models/user";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const dbUser = await findUserById(session.userId);
    if (!dbUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: dbUser._id!.toString(),
        email: dbUser.email,
        role: dbUser.role,
        purchasedItems: dbUser.purchasedItems || [],
      },
    });
  } catch (error) {
    console.error("Auth /me error:", error);
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}
