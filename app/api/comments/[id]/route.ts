import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/src/lib/auth";
import { updateCommentStatus, deleteComment, CommentStatus } from "@/src/models/comment";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json(
        { error: "Forbidden. Admin or manager role required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const { status } = await req.json();

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const result = await updateCommentStatus(
      id,
      status as CommentStatus,
      session.email
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Comment status updated to ${status}.`,
    });
  } catch (error) {
    console.error("Update comment status error:", error);
    return NextResponse.json(
      { error: "Failed to update comment status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json(
        { error: "Forbidden. Admin or manager role required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const result = await deleteComment(id);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment removed successfully.",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment." },
      { status: 500 }
    );
  }
}
