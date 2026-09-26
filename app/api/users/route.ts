import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession, hasRole } from "@/src/lib/auth";
import { getAllUsers, updateUserRole, createUser, findUserByEmail } from "@/src/models/user";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json({ error: "Forbidden. Requires manager or admin access." }, { status: 403 });
    }

    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}

// Manager or Admin can create/register a user directly
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json({ error: "Forbidden. Requires manager or admin access." }, { status: 403 });
    }

    const { email, password, role, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Only Admin can assign "admin" role
    if (role === "admin" && session.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create an admin account" }, { status: 403 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({
      email,
      passwordHash,
      role: role || "user",
      name: name || "",
      purchasedItems: [],
    });

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// Admin only can update roles
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Only admins can modify user roles." }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required." }, { status: 400 });
    }

    if (!["admin", "manager", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }

    await updateUserRole(userId, role);
    return NextResponse.json({ success: true, message: `Role updated to ${role}` });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
