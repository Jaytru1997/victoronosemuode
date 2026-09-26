import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "@/src/models/user";
import { signToken } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // New signups are always assigned the "user" role by default
    const userId = await createUser({
      email: normalizedEmail,
      name: name?.trim() || "",
      passwordHash,
      role: "user",
      purchasedItems: [],
      createdAt: new Date(),
    });

    // Auto-login: Sign JWT session token
    const token = await signToken({
      userId: userId.toString(),
      email: normalizedEmail,
      role: "user",
    });

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: userId.toString(),
        email: normalizedEmail,
        role: "user",
      },
    });

    // Set session cookie
    response.cookies.set({
      name: "session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please ensure database connection is established." },
      { status: 500 }
    );
  }
}
