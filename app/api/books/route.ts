import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/src/lib/auth";
import { getAllBooks, createBook } from "@/src/models/book";

export async function GET() {
  try {
    const books = await getAllBooks();
    return NextResponse.json({ success: true, books });
  } catch (error) {
    console.error("Fetch books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books from database" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Only managers and administrators can add books
    if (!hasRole(session.role, ["admin", "manager"])) {
      return NextResponse.json(
        { error: "Forbidden. Only managers and administrators can add books." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, note, price, coverImage, tone, category, author, currency } = body;

    if (!title || !note) {
      return NextResponse.json(
        { error: "Book title and description/note are required." },
        { status: 400 }
      );
    }

    const parsedPrice = typeof price === "number" ? price : parseFloat(price) || 0;

    const bookId = await createBook({
      title: title.trim(),
      note: note.trim(),
      price: parsedPrice,
      currency: currency || "NGN",
      coverImage: coverImage?.trim() || "/annual-vestry-meeting-poster.png",
      tone: tone || "book-green",
      category: category?.trim() || "Ministry & Worship",
      author: author?.trim() || "Ven. Victor A. Onosemuode JP",
      inStock: true,
    });

    return NextResponse.json({
      success: true,
      message: "Book added successfully to catalog",
      bookId: bookId.toString(),
    });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json(
      { error: "Failed to save book to database" },
      { status: 500 }
    );
  }
}
