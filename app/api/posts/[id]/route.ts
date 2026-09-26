import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/src/lib/auth";
import { updatePost, deletePost, getPostById } from "@/src/models/post";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json({ error: "Forbidden. Requires manager or admin role." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    await updatePost(id, {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
    });

    return NextResponse.json({ success: true, message: "Post updated successfully" });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json({ error: "Forbidden. Requires manager or admin role." }, { status: 403 });
    }

    const { id } = await context.params;
    await deletePost(id);

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
