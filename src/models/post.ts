import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb";

export interface Post {
  _id?: ObjectId;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  authorEmail?: string;
  authorRole?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/** Get the posts collection */
export async function getPostsCollection() {
  const db = await getDb();
  return db.collection<Post>("posts");
}

/** Get all posts sorted by newest first */
export async function getAllPosts() {
  const collection = await getPostsCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

/** Get a single post by ID */
export async function getPostById(id: string) {
  try {
    const collection = await getPostsCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/** Create a new post */
export async function createPost(
  post: Omit<Post, "_id" | "createdAt" | "updatedAt">
) {
  const collection = await getPostsCollection();
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const result = await collection.insertOne({
    ...post,
    slug,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
}

/** Update a post */
export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "_id" | "createdAt" | "updatedAt">>
) {
  const collection = await getPostsCollection();
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

/** Delete a post */
export async function deletePost(id: string) {
  const collection = await getPostsCollection();
  return collection.deleteOne({ _id: new ObjectId(id) });
}
