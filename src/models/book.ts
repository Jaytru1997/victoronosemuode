import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb";

export interface Book {
  _id?: ObjectId;
  title: string;
  slug?: string;
  note: string;
  price: number;
  currency?: string;
  coverImage: string;
  tone?: string;
  category?: string;
  author?: string;
  inStock?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export const defaultBooksSeed: Omit<Book, "_id" | "createdAt" | "updatedAt">[] = [
  {
    title: "The Handbook for Conducting Annual Vestry Meetings",
    slug: "annual-vestry-meetings-handbook",
    note: "A practical handbook for church administration, vestry procedures, and annual parish meetings.",
    price: 3500,
    currency: "NGN",
    coverImage: "/annual-vestry-meeting-poster.png",
    tone: "book-green",
    category: "Church Administration",
    author: "Ven. Victor A. Onosemuode JP",
    inStock: true,
  },
  {
    title: "My Patmos",
    slug: "my-patmos",
    note: "God Speaks – A personal work among the five legacy books written to nurture faith and Christian devotion.",
    price: 4000,
    currency: "NGN",
    coverImage: "/my-patmos-poster.png",
    tone: "book-ochre",
    category: "Daily Devotional",
    author: "Ven. Victor A. Onosemuode JP",
    inStock: true,
  },
  {
    title: "The Hymnfinder",
    slug: "the-hymnfinder",
    note: "A comprehensive reference resource for discovering hymns and enriching congregational worship.",
    price: 5000,
    currency: "NGN",
    coverImage: "/the-hymnfinder-poster.png",
    tone: "book-rust",
    category: "Hymnology & Worship",
    author: "Ven. Victor A. Onosemuode JP",
    inStock: true,
  },
  {
    title: "Youth and Children Hymn Book",
    slug: "youth-and-children-hymn-book",
    note: "Containing hymns and spiritual songs for youth services, assemblies, conventions, and school devotions.",
    price: 3000,
    currency: "NGN",
    coverImage: "/youth-children-hymn-book-poster.png",
    tone: "book-blue",
    category: "Youth & School Ministry",
    author: "Ven. Victor A. Onosemuode JP",
    inStock: true,
  },
  {
    title: "Historical Encounter of Some Hymn Writers",
    slug: "historical-encounter-hymn-writers",
    note: "Inspiring biographies of hymn writers and composers, accompanied by scriptures and historical context.",
    price: 4500,
    currency: "NGN",
    coverImage: "/historical-encounter-poster.webp",
    tone: "book-plum",
    category: "Hymn History & Biographies",
    author: "Ven. Victor A. Onosemuode JP",
    inStock: true,
  },
];

/** Get the books collection */
export async function getBooksCollection() {
  const db = await getDb();
  return db.collection<Book>("books");
}

/** Seed default books if the collection is currently empty */
export async function ensureDefaultBooksSeeded() {
  const collection = await getBooksCollection();
  const count = await collection.countDocuments();
  if (count === 0) {
    const seedDocs = defaultBooksSeed.map((book) => ({
      ...book,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await collection.insertMany(seedDocs);
  }
}

/** Get all books sorted by creation date or order */
export async function getAllBooks(): Promise<Book[]> {
  const collection = await getBooksCollection();
  await ensureDefaultBooksSeeded();
  return collection.find({}).sort({ createdAt: 1 }).toArray();
}

/** Get a single book by ID */
export async function getBookById(id: string): Promise<Book | null> {
  try {
    const collection = await getBooksCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/** Create a new book */
export async function createBook(
  book: Omit<Book, "_id" | "createdAt" | "updatedAt">
): Promise<ObjectId> {
  const collection = await getBooksCollection();
  const slug =
    book.slug ||
    book.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const result = await collection.insertOne({
    ...book,
    slug,
    currency: book.currency || "NGN",
    inStock: book.inStock ?? true,
    author: book.author || "Ven. Victor A. Onosemuode JP",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
}

/** Update an existing book */
export async function updateBook(
  id: string,
  updates: Partial<Omit<Book, "_id" | "createdAt" | "updatedAt">>
) {
  const collection = await getBooksCollection();
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

/** Delete a book */
export async function deleteBook(id: string) {
  const collection = await getBooksCollection();
  return collection.deleteOne({ _id: new ObjectId(id) });
}
