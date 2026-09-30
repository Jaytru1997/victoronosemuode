import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/src/lib/auth";
import {
  createComment,
  getApprovedCommentsForPost,
  getAllComments,
  getPendingCommentsCount,
  CommentStatus,
} from "@/src/models/comment";
import { findUserById } from "@/src/models/user";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const slug = searchParams.get("slug");
    const status = searchParams.get("status") as CommentStatus | null;
    const statsOnly = searchParams.get("stats") === "true";

    // Public fetch: If requesting comments for a specific post/slug, return approved comments
    if (postId || slug) {
      const identifier = postId || slug || "";
      const comments = await getApprovedCommentsForPost(identifier);
      return NextResponse.json({ comments });
    }

    // Admin / Manager Moderation view
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json(
        { error: "Forbidden. Admin or Manager role required." },
        { status: 403 }
      );
    }

    if (statsOnly) {
      const pendingCount = await getPendingCommentsCount();
      return NextResponse.json({ pendingCount });
    }

    const comments = await getAllComments(status || undefined);
    const pendingCount = await getPendingCommentsCount();

    return NextResponse.json({
      comments,
      pendingCount,
    });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to leave a comment." },
        { status: 401 }
      );
    }

    const { postId, postSlug, postTitle, content } = await req.json();

    if (!postId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Post ID and comment content are required." },
        { status: 400 }
      );
    }

    if (content.trim().length < 2) {
      return NextResponse.json(
        { error: "Comment is too short. Please write at least a few words." },
        { status: 400 }
      );
    }

    // Lookup user display name if available
    const dbUser = await findUserById(session.userId);
    const authorName = dbUser?.name?.trim() || session.email.split("@")[0];

    const commentId = await createComment({
      postId: String(postId),
      postSlug: postSlug || "",
      postTitle: postTitle || "Ministry Post",
      userId: session.userId,
      authorEmail: session.email,
      authorName,
      content: content.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your comment has been submitted and will appear once confirmed by an administrator.",
        commentId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to submit comment" },
      { status: 500 }
    );
  }
}
