import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb";

export type MeetingStatus = "pending" | "scheduled" | "completed" | "cancelled" | "rescheduled";

export interface Meeting {
  _id?: ObjectId;
  title: string;
  description?: string;
  organizer: ObjectId; // ref to users collection
  client: ObjectId; // ref to users collection
  clientName?: string; // denormalised for quick display
  clientEmail?: string; // denormalised for quick display
  startTime: Date;
  endTime: Date;
  timezone: string; // e.g. "Africa/Lagos"
  duration: number; // minutes
  location?: string;
  meetingUrl?: string;
  notes?: string;
  status: MeetingStatus;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Get the meetings collection */
export async function getMeetingsCollection() {
  const db = await getDb();
  return db.collection<Meeting>("meetings");
}

/** Ensure indexes exist for performance-critical queries */
export async function ensureMeetingIndexes() {
  const collection = await getMeetingsCollection();
  await collection.createIndex({ organizer: 1, startTime: 1 });
  await collection.createIndex({ client: 1, startTime: 1 });
  await collection.createIndex({ startTime: 1, endTime: 1 });
  await collection.createIndex({ status: 1 });
}

/**
 * Check if a proposed time window overlaps with any existing meetings
 * for the given organizer. Cancelled meetings are excluded.
 *
 * Two meetings overlap when:
 *   existing.startTime < requested.endTime
 *   AND existing.endTime > requested.startTime
 *
 * @param excludeMeetingId  Optional meeting ID to exclude (for rescheduling)
 */
export async function findOverlappingMeetings(
  organizerId: ObjectId,
  startTime: Date,
  endTime: Date,
  excludeMeetingId?: string
) {
  const collection = await getMeetingsCollection();
  const filter: Record<string, unknown> = {
    organizer: organizerId,
    status: { $nin: ["cancelled"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeMeetingId) {
    filter._id = { $ne: new ObjectId(excludeMeetingId) };
  }
  return collection.find(filter).toArray();
}

/** Create a meeting after overlap validation has been performed */
export async function createMeeting(
  meeting: Omit<Meeting, "_id" | "createdAt" | "updatedAt">
): Promise<ObjectId> {
  const collection = await getMeetingsCollection();
  const result = await collection.insertOne({
    ...meeting,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
}

/** Get a single meeting by ID */
export async function getMeetingById(id: string): Promise<Meeting | null> {
  try {
    const collection = await getMeetingsCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/**
 * Get all meetings where the user is the organizer OR the client.
 * Optionally filter by a date range.
 */
export async function getMeetingsForUser(
  userId: string,
  options?: { from?: Date; to?: Date; status?: MeetingStatus }
) {
  const collection = await getMeetingsCollection();
  const oid = new ObjectId(userId);

  const filter: Record<string, unknown> = {
    $or: [{ organizer: oid }, { client: oid }],
  };

  if (options?.from || options?.to) {
    const timeFilter: Record<string, unknown> = {};
    if (options.from) timeFilter.$gte = options.from;
    if (options.to) timeFilter.$lte = options.to;
    filter.startTime = timeFilter;
  }

  if (options?.status) {
    filter.status = options.status;
  }

  return collection
    .find(filter)
    .sort({ startTime: 1 })
    .toArray();
}

/** Update a meeting */
export async function updateMeeting(
  id: string,
  updates: Partial<Omit<Meeting, "_id" | "createdAt" | "updatedAt">>
) {
  const collection = await getMeetingsCollection();
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

/** Cancel a meeting */
export async function cancelMeeting(id: string, reason?: string) {
  const collection = await getMeetingsCollection();
  return collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: "cancelled" as MeetingStatus,
        cancellationReason: reason || "",
        updatedAt: new Date(),
      },
    }
  );
}

/** Delete a meeting permanently (admin only) */
export async function deleteMeeting(id: string) {
  const collection = await getMeetingsCollection();
  return collection.deleteOne({ _id: new ObjectId(id) });
}

/**
 * Get booked time slots for a given organizer on a specific date.
 * Returns an array of { startTime, endTime } for non-cancelled meetings.
 */
export async function getBookedSlots(
  organizerId: string,
  date: Date // the start of day in user timezone
) {
  const collection = await getMeetingsCollection();
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const meetings = await collection
    .find({
      organizer: new ObjectId(organizerId),
      status: { $nin: ["cancelled"] },
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
    })
    .sort({ startTime: 1 })
    .project<{ startTime: Date; endTime: Date; title: string }>({
      startTime: 1,
      endTime: 1,
      title: 1,
    })
    .toArray();

  return meetings;
}
