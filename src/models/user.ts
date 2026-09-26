import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb";
import { Role } from "../lib/auth";

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string; // bcrypt hash
  role: Role;
  name?: string;
  purchasedItems?: string[]; // IDs or titles of purchased books/resources
  createdAt?: Date;
}

/** Get the users collection */
export async function getUsersCollection() {
  const db = await getDb();
  return db.collection<User>("users");
}

/** Create a new user */
export async function createUser(user: Omit<User, "_id">) {
  const collection = await getUsersCollection();
  const result = await collection.insertOne({
    ...user,
    createdAt: user.createdAt || new Date(),
    purchasedItems: user.purchasedItems || [],
  });
  return result.insertedId;
}

/** Find a user by email (case-insensitive) */
export async function findUserByEmail(email: string) {
  const collection = await getUsersCollection();
  const cleanEmail = email.trim();
  const escaped = cleanEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  return collection.findOne({
    email: { $regex: new RegExp(`^${escaped}$`, "i") },
  });
}

/** Find a user by ID */
export async function findUserById(id: string) {
  try {
    const collection = await getUsersCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/** Get all users (sanitized, without password hash) */
export async function getAllUsers() {
  const collection = await getUsersCollection();
  return collection
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
}

/** Update a user's role (admin only) */
export async function updateUserRole(id: string, role: Role) {
  const collection = await getUsersCollection();
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role } }
  );
}
