import { ObjectId } from "mongodb";
import { getDb } from "@/src/lib/mongodb";

export interface SpeakingEvent {
  _id?: ObjectId | string;
  title: string;
  theme: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  clientRole: string;
  description: string;
  capacity: number;
  reservedSeats: number;
  category: "Synod" | "Hymnology" | "Youth Convention" | "Colloquium" | "Special Service" | string;
  status: "upcoming" | "completed";
  posterImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventReservation {
  _id?: ObjectId | string;
  reservationCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  seatsCount: number;
  notes?: string;
  userId?: string | null;
  status: "confirmed" | "cancelled";
  createdAt: Date;
}

export const defaultEventsSeed: Omit<SpeakingEvent, "_id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Anglican Diocesan Clergy & Laity Synod 2026",
    theme: "Anchored in Christ: Sustaining Pastoral Ministry in Changing Times",
    date: "October 14–16, 2026",
    time: "10:00 AM WAT",
    venue: "Cathedral Church of St. Andrew, Warri, Delta State",
    location: "Warri, Delta State",
    clientRole: "Keynote Speaker & Pastoral Mentor",
    description:
      "A grand gathering of clergy and lay delegates across Delta State. Ven. Victor Akpevwen Onosemuode (Rtd.) will deliver the keynote address on ministerial integrity, vestry administrative excellence, and prayer in the Anglican Communion.",
    capacity: 250,
    reservedSeats: 168,
    category: "Synod",
    status: "upcoming",
    posterImage: "/annual-vestry-meeting-poster.png",
  },
  {
    title: "Annual Hymnology & Choral Worship Festival",
    theme: "Sacred Harmonies: The Legacy and Spiritual Power of Anglican Hymns",
    date: "November 8, 2026",
    time: "3:00 PM WAT",
    venue: "All Saints' Chapel, Delta State University Campus, Abraka",
    location: "Abraka, Delta State",
    clientRole: "Guest Speaker & Special Dedication",
    description:
      "A joyful celebration of hymn writers, church choirs, and congregational singing. Featuring a lecture and special book dedication of 'The Hymnfinder' and 'Historical Encounter of Some Hymn Writers'.",
    capacity: 200,
    reservedSeats: 124,
    category: "Hymnology",
    status: "upcoming",
    posterImage: "/the-hymnfinder-poster.png",
  },
  {
    title: "National Christian Youth Fellowship Convention",
    theme: "Rooted in Faith, Equipped for the Future",
    date: "December 4–6, 2026",
    time: "9:00 AM WAT",
    venue: "Holy Trinity Youth Conference Centre, Ughelli, Delta State",
    location: "Ughelli, Delta State",
    clientRole: "Main Speaker & Youth Mentor",
    description:
      "Three impactful days of worship, Bible study, and mentorship for teenagers and young adults. Ven. Victor will minister from the 'Youth and Children Hymn Book' and provide life mentorship.",
    capacity: 350,
    reservedSeats: 210,
    category: "Youth Convention",
    status: "upcoming",
    posterImage: "/youth-children-hymn-book-poster.png",
  },
  {
    title: "Arhavwarien Community Christian Heritage Thanksgiving & Colloquium",
    theme: "Thus Far the Lord Has Helped Us: 70+ Years of Ministry and Faith",
    date: "January 18, 2027",
    time: "11:00 AM WAT",
    venue: "St. Peter's Anglican Church Auditorium, Arhavwarien, Delta State",
    location: "Arhavwarien, Delta State",
    clientRole: "Presiding Venerable & Preacher",
    description:
      "A historic community reunion and thanksgiving service honouring God's faithfulness, community elders, and the generational impact of Christian education in Urhoboland.",
    capacity: 180,
    reservedSeats: 95,
    category: "Colloquium",
    status: "upcoming",
    posterImage: "/my-patmos-poster.png",
  },
];

export async function getEventsCollection() {
  const db = await getDb();
  return db.collection<SpeakingEvent>("speaking_events");
}

export async function getReservationsCollection() {
  const db = await getDb();
  return db.collection<EventReservation>("event_reservations");
}

export async function ensureDefaultEventsSeeded() {
  const collection = await getEventsCollection();
  const count = await collection.countDocuments();
  if (count === 0) {
    const seedDocs = defaultEventsSeed.map((event) => ({
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await collection.insertMany(seedDocs);
  }
}
