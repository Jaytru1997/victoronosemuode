"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  CheckCircle2,
  X,
  Loader2,
  Mic,
  ArrowRight,
  Sparkles,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";

interface EventItem {
  _id: string;
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
  category: string;
  posterImage?: string;
}

const PRESET_POSTERS = [
  { label: "Annual Vestry Poster", value: "/annual-vestry-meeting-poster.png" },
  { label: "The Hymnfinder Poster", value: "/the-hymnfinder-poster.png" },
  { label: "Youth & Children Hymnal", value: "/youth-children-hymn-book-poster.png" },
  { label: "My Patmos Devotional", value: "/my-patmos-poster.png" },
  { label: "Historical Encounter", value: "/historical-encounter-poster.webp" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Reservation modal states
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [seatsCount, setSeatsCount] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<{ code: string } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Admin Add Event modal states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00 AM WAT");
  const [newVenue, setNewVenue] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRole, setNewRole] = useState("Attendee");
  const [newCapacity, setNewCapacity] = useState("200");
  const [newCategory, setNewCategory] = useState("Synod");
  const [newDescription, setNewDescription] = useState("");
  const [newPosterImage, setNewPosterImage] = useState("/annual-vestry-meeting-poster.png");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [addEventError, setAddEventError] = useState<string | null>(null);

  const { user } = useAuth();
  const { success, error } = useToast();

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const handleOpenReserve = (event: EventItem) => {
    setActiveModalEvent(event);
    setReservationSuccess(null);
    setModalError(null);
    setSeatsCount("1");
    if (user?.email) {
      setEmail(user.email);
    }
  };

  const handleCloseModal = () => {
    setActiveModalEvent(null);
    setReservationSuccess(null);
    setModalError(null);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalEvent) return;

    setSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch("/api/events/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: activeModalEvent._id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          seatsCount: Number(seatsCount) || 1,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reserve seat.");
      }

      setReservationSuccess({ code: data.reservationCode });
      success(`Reservation confirmed for ${activeModalEvent.title}!`, {
        title: `Reserved ${seatsCount} seat(s)`,
      });

      fetchEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to book reservation.";
      setModalError(msg);
      error(msg, { title: "Reservation could not be completed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEvent(true);
    setAddEventError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          theme: newTheme,
          date: newDate,
          time: newTime,
          venue: newVenue,
          location: newLocation || newVenue,
          clientRole: newRole,
          capacity: Number(newCapacity) || 100,
          category: newCategory,
          description: newDescription,
          posterImage: newPosterImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create event.");
      }

      success("Event added successfully!", { title: "Event Created" });
      setShowAddEventModal(false);
      setNewTitle("");
      setNewTheme("");
      setNewDate("");
      setNewVenue("");
      setNewDescription("");
      fetchEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add event.";
      setAddEventError(msg);
      error(msg, { title: "Could not create event" });
    } finally {
      setCreatingEvent(false);
    }
  };

  const categories = ["All", "Synod", "Hymnology", "Youth Convention", "Colloquium", "Special Service", "Conference", "Retreat", "Workshop", "Anniversary", "Other"];

  const filteredEvents =
    selectedCategory === "All"
      ? events
      : events.filter((ev) => ev.category === selectedCategory);

  return (
    <div style={{ background: "var(--paper, #f8f7f1)", minHeight: "100vh", paddingBottom: "6rem" }}>
      {/* Hero Banner */}
      <section
        style={{
          background: "linear-gradient(180deg, #173a32 0%, #112822 100%)",
          color: "#ffffff",
          padding: "5rem 1.5rem 4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="page-width" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(192, 154, 88, 0.18)",
                  color: "#e8d2a3",
                  padding: "4px 14px",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: "750",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                  border: "1px solid rgba(192, 154, 88, 0.35)",
                }}
              >
                <Calendar size={14} /> Ministry Engagements &amp; Calendar
              </div>
              <h1
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  fontWeight: "400",
                  margin: "0 0 1rem",
                  lineHeight: "1.15",
                  color: "#ffffff",
                }}
              >
                Events &amp; Engagements
              </h1>
              <p
                style={{
                  fontSize: "1.1rem",
                  maxWidth: "680px",
                  lineHeight: "1.6",
                  color: "#d1d5db",
                  margin: 0,
                }}
              >
                Join Ven. Victor Akpevwen Onosemuode (Rtd.) at upcoming synods, conferences, festivals, and community worship gatherings. Reserve your seat early to secure access.
              </p>
            </div>

            {/* Admin / Manager Action: Add Event Button */}
            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={() => setShowAddEventModal(true)}
                className="button"
                style={{
                  background: "#c09a58",
                  color: "#173a32",
                  fontWeight: "800",
                  borderRadius: "8px",
                  padding: "0 1.5rem",
                  minHeight: "46px",
                  gap: "0.5rem",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                }}
              >
                <Plus size={18} /> Add Event
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="page-width" style={{ marginTop: "2.5rem" }}>
        {/* Category Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
            paddingBottom: "0.75rem",
            borderBottom: "1px solid var(--line, #d8ddd6)",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: selectedCategory === cat ? "var(--rust, #a64b32)" : "var(--line, #d8ddd6)",
                background: selectedCategory === cat ? "var(--rust, #a64b32)" : "#ffffff",
                color: selectedCategory === cat ? "#ffffff" : "var(--ink, #173a32)",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--muted, #5c6e66)" }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 1rem", opacity: 0.6 }} />
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", background: "#ffffff", borderRadius: "12px", border: "1px solid var(--line, #d8ddd6)" }}>
            <Calendar size={48} style={{ margin: "0 auto 1rem", color: "#94a3b8" }} />
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem", color: "var(--ink, #173a32)" }}>No events found</h3>
            <p style={{ color: "var(--muted, #5c6e66)", fontSize: "0.9rem" }}>No current events under this category. Please check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
            {filteredEvents.map((event, idx) => {
              const remainingSeats = Math.max(event.capacity - (event.reservedSeats || 0), 0);
              const isFull = remainingSeats <= 0;
              const poster = event.posterImage || PRESET_POSTERS[idx % PRESET_POSTERS.length].value;

              return (
                <article
                  key={event._id}
                  className="event-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid var(--line, #d8ddd6)",
                    boxShadow: "0 6px 20px rgba(23, 58, 50, 0.05)",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  {/* ───────────────────────────────────────────────────────────── */}
                  {/* 50% OF THE EVENT CARD: IMAGE POSTER                           */}
                  {/* ───────────────────────────────────────────────────────────── */}
                  <div
                    className="event-card-poster"
                    style={{
                      position: "relative",
                      minHeight: "380px",
                      width: "100%",
                      background: "radial-gradient(circle at center, #264a40 0%, #15342c 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={poster}
                      alt={event.title}
                      fill
                      sizes="(max-width: 860px) 100vw, 50vw"
                      style={{
                        objectFit: "cover",
                        filter: "brightness(0.95)",
                        transition: "transform 0.4s ease",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(20,40,34,0.7) 100%)",
                      }}
                    />

                    {/* Floating badges on poster */}
                    <div
                      style={{
                        position: "absolute",
                        top: "1.25rem",
                        left: "1.25rem",
                        display: "flex",
                        gap: "0.5rem",
                        zIndex: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          padding: "0.3rem 0.75rem",
                          borderRadius: "999px",
                          background: "rgba(23, 58, 50, 0.9)",
                          color: "#ffffff",
                          backdropFilter: "blur(4px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        {event.category}
                      </span>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        bottom: "1.25rem",
                        left: "1.25rem",
                        right: "1.25rem",
                        color: "#ffffff",
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: "750",
                          color: "#e8d2a3",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Event Feature
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "750", lineHeight: "1.3" }}>
                        {event.title}
                      </div>
                    </div>
                  </div>

                  {/* ───────────────────────────────────────────────────────────── */}
                  {/* 50% OF THE EVENT CARD: EVENT DETAILS & RESERVATION            */}
                  {/* ───────────────────────────────────────────────────────────── */}
                  <div
                    className="event-card-details"
                    style={{
                      padding: "2rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "1.25rem",
                    }}
                  >
                    <div>
                      {/* Status & Seats badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontSize: "0.82rem",
                            fontWeight: "750",
                            color: "#166534",
                            background: "#dcfce7",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "6px",
                          }}
                        >
                          <Sparkles size={13} /> {event.clientRole || "Attendee"}
                        </div>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: "750",
                            padding: "0.25rem 0.7rem",
                            borderRadius: "999px",
                            background: isFull ? "#fee2e2" : "#f0fdf4",
                            color: isFull ? "#b91c1c" : "#15803d",
                          }}
                        >
                          {isFull ? "Fully Booked" : `${remainingSeats} seats available`}
                        </span>
                      </div>

                      <h2
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "1.45rem",
                          lineHeight: "1.25",
                          color: "var(--ink, #173a32)",
                          margin: "0 0 0.5rem",
                        }}
                      >
                        {event.title}
                      </h2>

                      {event.theme && (
                        <p
                          style={{
                            fontStyle: "italic",
                            fontSize: "0.95rem",
                            color: "var(--rust, #a64b32)",
                            margin: "0 0 1.25rem",
                            lineHeight: "1.4",
                          }}
                        >
                          Theme: “{event.theme}”
                        </p>
                      )}

                      {/* Meta info */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem", color: "#334155", marginBottom: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                          <Calendar size={17} color="var(--rust, #a64b32)" style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span><strong>Date:</strong> {event.date}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                          <Clock size={17} color="var(--rust, #a64b32)" style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span><strong>Time:</strong> {event.time}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                          <MapPin size={17} color="var(--rust, #a64b32)" style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span><strong>Venue:</strong> {event.venue}</span>
                        </div>
                      </div>

                      <p style={{ fontSize: "0.92rem", color: "var(--muted, #5c6e66)", lineHeight: "1.6", margin: 0 }}>
                        {event.description}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div
                      style={{
                        paddingTop: "1.25rem",
                        borderTop: "1px solid var(--line, #d8ddd6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Auditorium Capacity: {event.capacity} seats
                      </span>
                      <button
                        onClick={() => handleOpenReserve(event)}
                        disabled={isFull}
                        className="button button-rust"
                        style={{
                          minHeight: "44px",
                          padding: "0 1.4rem",
                          fontSize: "0.85rem",
                          borderRadius: "8px",
                          opacity: isFull ? 0.6 : 1,
                          cursor: isFull ? "not-allowed" : "pointer",
                        }}
                      >
                        <Ticket size={16} /> Reserve a Seat
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADMIN ADD NEW SPEAKING EVENT MODAL                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showAddEventModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={() => setShowAddEventModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(15, 37, 31, 0.7)", backdropFilter: "blur(4px)" }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 10,
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "620px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
              border: "1px solid var(--line, #d8ddd6)",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.75rem",
                borderBottom: "1px solid var(--line, #d8ddd6)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--paper, #f8f7f1)",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.2rem", fontFamily: "Georgia, serif", color: "var(--ink, #173a32)" }}>
                  Add New Event
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--muted, #5c6e66)" }}>
                  Admin / Manager event publishing tool
                </span>
              </div>
              <button onClick={() => setShowAddEventModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {addEventError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "6px", fontSize: "0.88rem" }}>
                  {addEventError}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anglican Diocesan Clergy & Laity Synod 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Theme
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anchored in Christ: Sustaining Pastoral Ministry"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "#ffffff" }}
                  >
                    <option value="Synod">Synod</option>
                    <option value="Hymnology">Hymnology</option>
                    <option value="Youth Convention">Youth Convention</option>
                    <option value="Colloquium">Colloquium</option>
                    <option value="Special Service">Special Service</option>
                    <option value="Conference">Conference</option>
                    <option value="Retreat">Retreat</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Attendee, Speaker, Guest Minister, Special Guest"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 14–16, 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM WAT"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Venue &amp; Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cathedral Church of St. Andrew, Warri, Delta State"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Auditorium Capacity
                  </label>
                  <input
                    type="number"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              {/* Poster Image selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Image Poster for Event (Fills 50% of the Event Card)
                </label>
                <select
                  value={newPosterImage}
                  onChange={(e) => setNewPosterImage(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "#ffffff", marginBottom: "0.5rem" }}
                >
                  {PRESET_POSTERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} ({p.value})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom image URL: /your-event-poster.png"
                  value={newPosterImage}
                  onChange={(e) => setNewPosterImage(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Event Description &amp; Programme Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed description of the gathering, topics to be taught, and significance..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  style={{ padding: "0.7rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="button button-rust"
                  style={{ minHeight: "44px", padding: "0 1.5rem" }}
                >
                  {creatingEvent ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>Publish Event</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: USER SEAT RESERVATION MODAL                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeModalEvent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={handleCloseModal}
            style={{ position: "fixed", inset: 0, background: "rgba(15, 37, 31, 0.7)", backdropFilter: "blur(4px)" }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 10,
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
              border: "1px solid var(--line, #d8ddd6)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--line, #d8ddd6)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--paper, #f8f7f1)",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.15rem", fontFamily: "Georgia, serif", color: "var(--ink, #173a32)" }}>
                  Reserve Your Seat
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--muted, #5c6e66)" }}>
                  {activeModalEvent.title}
                </span>
              </div>
              <button onClick={handleCloseModal} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              {reservationSuccess ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0.5rem" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "#dcfce7",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto 1.25rem",
                      color: "#16a34a",
                    }}
                  >
                    <CheckCircle2 size={34} />
                  </div>
                  <h4 style={{ fontFamily: "Georgia, serif", fontSize: "1.35rem", margin: "0 0 0.5rem", color: "var(--ink, #173a32)" }}>
                    Seat Reserved Successfully!
                  </h4>
                  <div
                    style={{
                      display: "inline-block",
                      background: "#f1f5f9",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontWeight: "800",
                      fontSize: "1rem",
                      color: "var(--rust, #a64b32)",
                      margin: "0.5rem 0 1rem",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Reservation Code: {reservationSuccess.code}
                  </div>
                  <p style={{ color: "var(--muted, #5c6e66)", fontSize: "0.9rem", lineHeight: "1.55", maxWidth: "360px", margin: "0 auto 1.5rem" }}>
                    Your seat reservation has been recorded and added to your <strong>Scheduled Events</strong> list in your Member Dashboard.
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                    <Link href="/dashboard" className="button button-rust" style={{ minHeight: "42px", padding: "0 1.25rem" }}>
                      View in Dashboard
                    </Link>
                    <button
                      onClick={handleCloseModal}
                      style={{ padding: "0 1.25rem", borderRadius: "6px", border: "1px solid var(--line, #d8ddd6)", background: "#ffffff", color: "var(--muted, #5c6e66)", fontWeight: "600", cursor: "pointer" }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReservationSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {modalError && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "6px", fontSize: "0.88rem" }}>
                      {modalError}
                    </div>
                  )}

                  <div style={{ background: "rgba(23, 58, 50, 0.05)", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", color: "var(--ink, #173a32)" }}>
                    <div><strong>Date:</strong> {activeModalEvent.date} · {activeModalEvent.time}</div>
                    <div><strong>Venue:</strong> {activeModalEvent.venue}</div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sister Grace Ejiro"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 800 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                        Seats to Reserve
                      </label>
                      <select
                        value={seatsCount}
                        onChange={(e) => setSeatsCount(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem", background: "#ffffff" }}
                      >
                        <option value="1">1 Seat</option>
                        <option value="2">2 Seats</option>
                        <option value="3">3 Seats</option>
                        <option value="4">4 Seats</option>
                        <option value="5">5 Seats</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                        Church / Parish (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. St. Barnabas, Arhavwarien"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      style={{ padding: "0.7rem 1.1rem", borderRadius: "6px", border: "1px solid var(--line, #d8ddd6)", background: "#ffffff", color: "var(--muted, #5c6e66)", fontWeight: "600", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="button button-rust"
                      style={{ flex: 1, minHeight: "44px", justifyContent: "center" }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Reserving...
                        </>
                      ) : (
                        <>Confirm Reservation</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
