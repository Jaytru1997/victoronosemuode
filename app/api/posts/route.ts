import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/src/lib/auth";
import { getAllPosts, createPost } from "@/src/models/post";

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Admin and Manager can write posts
    if (!hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json(
        { error: "Forbidden. Only managers and administrators can write posts." },
        { status: 403 }
      );
    }

    const { title, excerpt, content, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Post title and content are required." },
        { status: 400 }
      );
    }

    const postId = await createPost({
      title,
      excerpt: excerpt || title.slice(0, 150),
      content,
      category: category || "Ministry & Teachings",
      authorEmail: session.email,
      authorRole: session.role,
    });

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      postId,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
