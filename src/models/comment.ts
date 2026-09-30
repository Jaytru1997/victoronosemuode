import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb";

export type CommentStatus = "pending" | "approved" | "rejected";

export interface Comment {
  _id?: ObjectId;
  postId: string;
  postSlug?: string;
  postTitle?: string;
  userId: string;
  authorEmail: string;
  authorName: string;
  content: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

/** Get the comments collection */
export async function getCommentsCollection() {
  const db = await getDb();
  return db.collection<Comment>("comments");
}

/** Get approved comments for a post */
export async function getApprovedCommentsForPost(postIdOrSlug: string) {
  const collection = await getCommentsCollection();
  return collection
    .find({
      $or: [{ postId: postIdOrSlug }, { postSlug: postIdOrSlug }],
      status: "approved",
    })
    .sort({ createdAt: 1 })
    .toArray();
}

/** Get all comments (with optional status filter) for admin/manager moderation */
export async function getAllComments(status?: CommentStatus) {
  const collection = await getCommentsCollection();
  const query = status ? { status } : {};
  return collection.find(query).sort({ createdAt: -1 }).toArray();
}

/** Get pending comments count for dashboard notification badge */
export async function getPendingCommentsCount() {
  const collection = await getCommentsCollection();
  return collection.countDocuments({ status: "pending" });
}

/** Create a new comment (always pending confirmation) */
export async function createComment(
  comment: Omit<Comment, "_id" | "status" | "createdAt" | "updatedAt">
) {
  const collection = await getCommentsCollection();
  const newComment: Comment = {
    ...comment,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await collection.insertOne(newComment);
  return result.insertedId;
}

/** Update comment status (admin/manager approval or rejection) */
export async function updateCommentStatus(
  commentId: string,
  status: CommentStatus,
  reviewerEmail?: string
) {
  const collection = await getCommentsCollection();
  const updates: Partial<Comment> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "approved") {
    updates.approvedAt = new Date();
    if (reviewerEmail) {
      updates.approvedBy = reviewerEmail;
    }
  }

  return collection.updateOne(
    { _id: new ObjectId(commentId) },
    { $set: updates }
  );
}

/** Delete a comment */
export async function deleteComment(commentId: string) {
  const collection = await getCommentsCollection();
  return collection.deleteOne({ _id: new ObjectId(commentId) });
}
