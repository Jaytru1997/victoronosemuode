import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/src/lib/auth";
import { getBookById, updateBook, deleteBook } from "@/src/models/book";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const book = await getBookById(id);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, book });
  } catch (error) {
    console.error("Get book error:", error);
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json(
        { error: "Forbidden. Requires manager or admin role." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const price = body.price !== undefined ? (typeof body.price === "number" ? body.price : parseFloat(body.price) || 0) : undefined;

    await updateBook(id, {
      ...(body.title && { title: body.title.trim() }),
      ...(body.note && { note: body.note.trim() }),
      ...(price !== undefined && { price }),
      ...(body.coverImage && { coverImage: body.coverImage.trim() }),
      ...(body.tone && { tone: body.tone }),
      ...(body.category && { category: body.category.trim() }),
      ...(body.author && { author: body.author.trim() }),
      ...(body.inStock !== undefined && { inStock: Boolean(body.inStock) }),
    });

    return NextResponse.json({ success: true, message: "Book updated successfully" });
  } catch (error) {
    console.error("Update book error:", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json(
        { error: "Forbidden. Requires manager or admin role." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    await deleteBook(id);

    return NextResponse.json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
