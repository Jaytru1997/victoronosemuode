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

/** Get a single post by slug */
export async function getPostBySlug(slug: string) {
  try {
    const collection = await getPostsCollection();
    return await collection.findOne({ slug });
  } catch {
    return null;
  }
}

/** Get a single post by slug or ID */
export async function getPostBySlugOrId(identifier: string) {
  try {
    const collection = await getPostsCollection();
    // First try by slug
    let post = await collection.findOne({ slug: identifier });
    if (post) return post;

    // Then try by ObjectId if it looks like one
    if (ObjectId.isValid(identifier)) {
      post = await collection.findOne({ _id: new ObjectId(identifier) });
      if (post) return post;
    }

    return null;
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
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };

  const updateFields: Partial<Post> = {
    ...updates,
    updatedAt: new Date(),
  };

  if (updates.title && !updates.slug) {
    updateFields.slug = updates.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  return collection.updateOne(query, { $set: updateFields });
}

/** Delete a post */
export async function deletePost(id: string) {
  const collection = await getPostsCollection();
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };
  return collection.deleteOne(query);
}
