"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  X,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  Video,
  FileText,
  RotateCcw,
  Trash2,
  Edit3,
  Sparkles,
  Ticket,
  Check,
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";
import { useAuth } from "@/src/context/AuthContext";

/* ───────────────────── Types ───────────────────── */

interface MeetingData {
  _id: string;
  title: string;
  description?: string;
  organizer: string;
  client: string;
  clientName?: string;
  clientEmail?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  duration: number;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  status: "pending" | "scheduled" | "completed" | "cancelled" | "rescheduled";
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  _id: string;
  title: string;
  theme?: string;
  date: string;
  time: string;
  venue: string;
  location?: string;
  clientRole?: string;
  description?: string;
  capacity?: number;
  reservedSeats?: number;
  category?: string;
  posterImage?: string;
  status?: string;
}

interface UserOption {
  _id: string;
  email: string;
  role: string;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
  title: string;
}

type CalendarView = "month" | "week" | "day";

/* ───────────────────── Helpers ─────────────────── */

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad(m)} ${ampm}`;
}

function formatDateLong(d: Date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateShort(d: Date) {
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Fill in previous month days for alignment
  const staRtdow = firstDay.getDay();
  for (let i = staRtdow - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Fill remaining cells
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function getWeekDays(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return days;
}

/** Check if speaking event matches a calendar date */
function doesEventMatchDay(eventDateStr: string, day: Date): boolean {
  if (!eventDateStr) return false;

  // Direct Date parse check
  const parsed = new Date(eventDateStr);
  if (!isNaN(parsed.getTime()) && isSameDay(parsed, day)) {
    return true;
  }

  const monthName = MONTHS[day.getMonth()];
  const dateNum = day.getDate();
  const yearNum = day.getFullYear();

  const lower = eventDateStr.toLowerCase();
  const monthLower = monthName.toLowerCase();

  if (lower.includes(monthLower)) {
    // If year is present, match it
    if (lower.includes(String(yearNum))) {
      // Check range e.g. "October 14–16, 2026" or "14-16"
      const rangeMatch = eventDateStr.match(/(\d+)\s*[–-]\s*(\d+)/);
      if (rangeMatch) {
        const staRtd = parseInt(rangeMatch[1], 10);
        const endD = parseInt(rangeMatch[2], 10);
        if (dateNum >= staRtd && dateNum <= endD) {
          return true;
        }
      } else {
        const numbers = eventDateStr.match(/\b\d{1,2}\b/g);
        if (numbers && numbers.some((n) => parseInt(n, 10) === dateNum)) {
          return true;
        }
      }
    }
  }
  return false;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "#fef3c7", color: "#b45309", label: "Pending Approval" },
  scheduled: { bg: "#dbeafe", color: "#1d4ed8", label: "Scheduled" },
  completed: { bg: "#dcfce7", color: "#15803d", label: "Completed" },
  cancelled: { bg: "#fde8e8", color: "#b91c1c", label: "Cancelled" },
  rescheduled: { bg: "#fef3c7", color: "#b45309", label: "Rescheduled" },
};

/* ───────────────────── Component ──────────────────── */

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { success, error: toastError, warning, info } = useToast();

  // ── Calendar state ──
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [speakingEvents, setSpeakingEvents] = useState<CalendarEvent[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // ── Modals ──
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // ── Schedule / Book form ──
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formClientId, setFormClientId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("10:00");
  const [formDuration, setFormDuration] = useState(60);
  const [formLocation, setFormLocation] = useState("Google Meet (Virtual Consultation)");
  const [formMeetingUrl, setFormMeetingUrl] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ── Client search (admin/manager) ──
  const [clients, setClients] = useState<UserOption[]>([]);
  const [clientSearch, setClientSearch] = useState("");

  // ── Availability ──
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  // ── Cancel modal ──
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const canManage = user?.role === "admin" || user?.role === "manager";

  /* ── Fetch meetings & speaking events ── */
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Fetch meetings (for logged in user)
      if (user) {
        const from = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const to = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
        const res = await fetch(`/api/meetings?from=${from.toISOString()}&to=${to.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          setMeetings(data.meetings || []);
        }
      }

      // Fetch public speaking events
      const eventRes = await fetch("/api/events");
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setSpeakingEvents(eventData.events || []);
      }
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user, currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Fetch clients list (for admin/manager) ── */
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "manager")) {
      fetch("/api/users")
        .then((r) => r.json())
        .then((d) => {
          if (d.users) setClients(d.users);
        })
        .catch(console.error);
    }
  }, [user]);

  /* ── Fetch availability when date changes in form ── */
  useEffect(() => {
    if (!formDate) return;
    fetch(`/api/meetings/availability?date=${formDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.bookedSlots) setBookedSlots(d.bookedSlots);
      })
      .catch(console.error);
  }, [formDate]);

  /* ── Computed: items for day ── */
  const meetingsForDay = useCallback(
    (day: Date) => meetings.filter((m) => isSameDay(new Date(m.startTime), day)),
    [meetings]
  );

  const eventsForDay = useCallback(
    (day: Date) => speakingEvents.filter((ev) => doesEventMatchDay(ev.date, day)),
    [speakingEvents]
  );

  const meetingsForSelectedDate = useMemo(() => {
    return meetings.filter((m) => isSameDay(new Date(m.startTime), selectedDate));
  }, [meetings, selectedDate]);

  const eventsForSelectedDate = useMemo(() => {
    return speakingEvents.filter((ev) => doesEventMatchDay(ev.date, selectedDate));
  }, [speakingEvents, selectedDate]);

  /* ── Computed: end time preview ── */
  const endTimePreview = useMemo(() => {
    if (!formDate || !formStartTime) return "";
    const start = new Date(`${formDate}T${formStartTime}:00`);
    if (isNaN(start.getTime())) return "";
    const end = new Date(start.getTime() + formDuration * 60_000);
    return `${formatDateLong(start)}\n${formatTime(start)} – ${formatTime(end)}`;
  }, [formDate, formStartTime, formDuration]);

  /* ── Check if a time slot conflicts with booked slots ── */
  const isTimeConflicting = useCallback(
    (time: string) => {
      if (!formDate) return false;
      const start = new Date(`${formDate}T${time}:00`);
      const end = new Date(start.getTime() + formDuration * 60_000);
      return bookedSlots.some((slot) => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        return slotStart < end && slotEnd > start;
      });
    },
    [formDate, formDuration, bookedSlots]
  );

  /* ── Filtered clients ── */
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter((c) => c.email.toLowerCase().includes(q));
  }, [clients, clientSearch]);

  /* ── Reset form ── */
  const resetForm = useCallback(() => {
    setFormTitle(user?.role === "user" ? "Spiritual Counseling & Pastoral Consultation" : "");
    setFormDescription("");
    setFormClientId(user?.role === "user" ? user.id : "");
    setFormDate("");
    setFormStartTime("10:00");
    setFormDuration(60);
    setFormLocation("Google Meet (Virtual Consultation)");
    setFormMeetingUrl("");
    setFormNotes("");
    setClientSearch("");
    setBookedSlots([]);
    setIsRescheduling(false);
  }, [user]);

  /* ── Open schedule / book modal ── */
  const openScheduleModal = useCallback(
    (date?: Date) => {
      if (!user) {
        router.push("/login");
        return;
      }
      resetForm();
      if (date) {
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        setFormDate(`${y}-${m}-${d}`);
      } else {
        const today = new Date();
        const y = today.getFullYear();
        const m = pad(today.getMonth() + 1);
        const d = pad(today.getDate());
        setFormDate(`${y}-${m}-${d}`);
      }
      setShowScheduleModal(true);
    },
    [user, resetForm, router]
  );

  /* ── Open reschedule ── */
  const openReschedule = useCallback(
    (meeting: MeetingData) => {
      resetForm();
      setIsRescheduling(true);
      setSelectedMeeting(meeting);
      setFormTitle(meeting.title);
      setFormDescription(meeting.description || "");
      setFormClientId(meeting.client);
      const start = new Date(meeting.startTime);
      setFormDate(
        `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
      );
      setFormStartTime(`${pad(start.getHours())}:${pad(start.getMinutes())}`);
      setFormDuration(meeting.duration);
      setFormLocation(meeting.location || "Google Meet (Virtual Consultation)");
      setFormMeetingUrl(meeting.meetingUrl || "");
      setFormNotes(meeting.notes || "");
      setShowDetailModal(false);
      setShowScheduleModal(true);
    },
    [resetForm]
  );

  /* ── Submit meeting / consultation ── */
  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      warning("Please enter a meeting title.");
      return;
    }
    if (!formClientId && canManage) {
      warning("Please select a client.");
      return;
    }
    if (!formDate) {
      warning("Please select a date.");
      return;
    }
    if (!formStartTime) {
      warning("Please select a start time.");
      return;
    }

    // Frontend conflict check
    if (isTimeConflicting(formStartTime)) {
      toastError("That time slot is already booked. Please choose a different time.");
      return;
    }

    setFormSubmitting(true);
    try {
      const url = isRescheduling && selectedMeeting
        ? `/api/meetings/${selectedMeeting._id}`
        : "/api/meetings";
      const method = isRescheduling ? "PUT" : "POST";

      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        clientId: formClientId || user?.id,
        date: formDate,
        startTime: formStartTime,
        duration: formDuration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: formLocation.trim() || "Google Meet (Virtual Consultation)",
        meetingUrl: formMeetingUrl.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to schedule meeting.");
        return;
      }

      if (isRescheduling) {
        success("Meeting rescheduled successfully.", { title: "Rescheduled" });
      } else if (data.status === "pending" || !canManage) {
        info(
          "Your consultation request has been submitted and is currently pending approval by the administration. You will be notified once confirmed.",
          { title: "Consultation Request Pending", duration: 7000 }
        );
      } else {
        success("Meeting scheduled successfully.", { title: "Meeting Scheduled" });
      }
      setShowScheduleModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Submit meeting error:", err);
      toastError("Unable to schedule the meeting. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  /* ── Cancel meeting ── */
  const handleCancelMeeting = async () => {
    if (!selectedMeeting) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/meetings/${selectedMeeting._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (!res.ok) {
        const d = await res.json();
        toastError(d.error || "Failed to cancel meeting.");
        return;
      }
      success("Meeting cancelled.", { title: "Cancelled" });
      setShowCancelModal(false);
      setShowDetailModal(false);
      setCancelReason("");
      fetchData();
    } catch {
      toastError("Failed to cancel meeting. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  /* ── Approve / Decline meeting (admin/manager) ── */
  const handleApproveMeeting = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      success("Meeting approved and confirmed for the client!", { title: "Meeting Approved" });
      setShowDetailModal(false);
      fetchData();
    } catch {
      toastError("Failed to approve meeting.");
    }
  };

  const handleDeclineMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to decline this consultation request?")) return;
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", cancellationReason: "Declined by admin." }),
      });
      if (!res.ok) throw new Error("Failed to decline");
      success("Meeting request declined.", { title: "Meeting Declined" });
      setShowDetailModal(false);
      fetchData();
    } catch {
      toastError("Failed to decline meeting.");
    }
  };

  /* ── Download ICS ── */
  const handleDownloadICS = async (meeting: MeetingData) => {
    try {
      const res = await fetch(`/api/meetings/${meeting._id}`, { method: "PATCH" });
      if (!res.ok) {
        toastError("Failed to generate calendar file.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${meeting.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success("Calendar file downloaded.");
    } catch {
      toastError("Failed to download calendar file.");
    }
  };

  /* ── Google Calendar URL ── */
  const getGoogleCalURL = (m: MeetingData) => {
    const start = new Date(m.startTime);
    const end = new Date(m.endTime);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: m.title,
      dates: `${fmt(start)}/${fmt(end)}`,
    });
    if (m.description) params.set("details", m.description);
    if (m.location) params.set("location", m.location);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  /* ── Navigation ── */
  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1));
  };
  const navigateWeek = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };
  const navigateDay = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir);
    setCurrentDate(d);
    setSelectedDate(d);
  };
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthDays = useMemo(
    () => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate]
  );
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  if (authLoading) {
    return (
      <div className="page-width" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem", color: "var(--rust)" }} />
        <p style={{ fontSize: "1.1rem", color: "#64748b" }}>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="page-width calendar-page" style={{ paddingBottom: "5rem" }}>
      {/* ──────── Header ──────── */}
      <div className="cal-header">
        <div className="cal-header-left">
          <h1 className="cal-title" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <CalIcon size={24} style={{ color: "var(--rust)" }} /> Ministry Calendar & Schedule
          </h1>
          <p className="cal-date-label">
            Speaking Engagements, Synods & Pastoral Consultations with Ven. Dr. Victor Onosemuode (Rtd.)
          </p>
        </div>
        <div className="cal-header-right" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            className="button button-rust cal-schedule-btn"
            onClick={() => openScheduleModal(selectedDate)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> {canManage ? "Schedule Meeting" : "Book a Meeting / Consultation"}
          </button>
          <Link
            href="/events"
            className="button"
            style={{
              background: "#ffffff",
              color: "var(--ink, #173a32)",
              border: "1px solid var(--line, #d8ddd6)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
            }}
          >
            <Ticket size={15} /> View All Events
          </Link>
        </div>
      </div>

      {/* ──────── Legend Bar ──────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap",
          padding: "0.6rem 1rem",
          background: "#ffffff",
          borderRadius: "8px",
          border: "1px solid var(--line, #e2e8f0)",
          marginBottom: "1rem",
          fontSize: "0.8rem",
          fontWeight: "600",
        }}
      >
        <span style={{ color: "#64748b" }}>Calendar Legend:</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#b45309" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
          Public Event / Synod
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#b45309" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
          Pending Approval
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#1d4ed8" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#1d4ed8" }} />
          Scheduled Consultation / Meeting
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#15803d" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#15803d" }} />
          Completed Session
        </span>
      </div>

      {/* ──────── View Switcher & Nav ──────── */}
      <div className="cal-controls">
        <div className="cal-view-tabs">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <button
              key={v}
              className={`cal-view-tab${view === v ? " cal-view-tab-active" : ""}`}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={goToToday}>
            Today
          </button>
          <button
            className="cal-nav-arrow"
            onClick={() =>
              view === "month"
                ? navigateMonth(-1)
                : view === "week"
                  ? navigateWeek(-1)
                  : navigateDay(-1)
            }
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="cal-nav-label">
            {view === "month"
              ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : view === "week"
                ? `${formatDateShort(weekDays[0])} – ${formatDateShort(weekDays[6])}, ${weekDays[6].getFullYear()}`
                : formatDateLong(currentDate)}
          </span>
          <button
            className="cal-nav-arrow"
            onClick={() =>
              view === "month"
                ? navigateMonth(1)
                : view === "week"
                  ? navigateWeek(1)
                  : navigateDay(1)
            }
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ──────── Calendar Grid ──────── */}
      <div className="cal-body">
        {loadingData && (
          <div className="cal-loading-overlay">
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--rust)" }} />
          </div>
        )}

        {/* ── MONTH VIEW ── */}
        {view === "month" && (
          <div className="cal-month-grid">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="cal-day-header">
                {d}
              </div>
            ))}
            {monthDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const dayMeetings = meetingsForDay(day);
              const dayEvents = eventsForDay(day);

              return (
                <button
                  key={i}
                  className={`cal-day-cell${isToday ? " cal-day-today" : ""}${isSelected ? " cal-day-selected" : ""}${!isCurrentMonth ? " cal-day-other" : ""}`}
                  onClick={() => setSelectedDate(day)}
                  onDoubleClick={() => {
                    setSelectedDate(day);
                    openScheduleModal(day);
                  }}
                  aria-label={`${day.toDateString()}`}
                >
                  <span className="cal-day-number">{day.getDate()}</span>

                  {/* Indicators for Events and Meetings */}
                  <div className="cal-day-dots" style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", alignItems: "center" }}>
                    {/* Speaking event indicator badge */}
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                          setShowEventModal(true);
                        }}
                        style={{
                          width: "92%",
                          fontSize: "9px",
                          fontWeight: "750",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          background: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fde68a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                        title={`Event: ${ev.title}`}
                      >
                        📢 {ev.title}
                      </div>
                    ))}

                    {/* Private meetings dots */}
                    {dayMeetings.length > 0 && (
                      <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
                        {dayMeetings.slice(0, 3).map((m, j) => (
                          <span
                            key={j}
                            className="cal-day-dot"
                            style={{ background: STATUS_STYLES[m.status]?.color || "#1d4ed8" }}
                            title={m.title}
                          />
                        ))}
                        {dayMeetings.length > 3 && (
                          <span className="cal-day-more">+{dayMeetings.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── WEEK VIEW ── */}
        {view === "week" && (
          <div className="cal-week-grid">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayMeetings = meetingsForDay(day);
              const dayEvents = eventsForDay(day);

              return (
                <div
                  key={i}
                  className={`cal-week-column${isToday ? " cal-week-today" : ""}${isSelected ? " cal-week-selected" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="cal-week-day-header">
                    <span className="cal-week-day-name">{DAYS_SHORT[day.getDay()]}</span>
                    <span className={`cal-week-day-num${isToday ? " cal-week-today-num" : ""}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="cal-week-events">
                    {/* Speaking Events */}
                    {dayEvents.map((ev) => (
                      <button
                        key={ev._id}
                        className="cal-event-chip"
                        style={{
                          borderLeft: "3px solid #f59e0b",
                          background: "#fffbeb",
                          marginBottom: "4px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                          setShowEventModal(true);
                        }}
                      >
                        <span className="cal-event-time" style={{ color: "#b45309", fontWeight: "750" }}>
                          📢 {ev.time}
                        </span>
                        <span className="cal-event-title" style={{ color: "#78350f" }}>
                          {ev.title}
                        </span>
                      </button>
                    ))}

                    {/* Meetings */}
                    {dayMeetings.map((m) => (
                      <button
                        key={m._id}
                        className="cal-event-chip"
                        style={{
                          borderLeft: `3px solid ${STATUS_STYLES[m.status]?.color || "#1d4ed8"}`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMeeting(m);
                          setShowDetailModal(true);
                        }}
                      >
                        <span className="cal-event-time">
                          {formatTime(new Date(m.startTime))}
                        </span>
                        <span className="cal-event-title">{m.title}</span>
                      </button>
                    ))}

                    {dayEvents.length === 0 && dayMeetings.length === 0 && (
                      <div className="cal-week-empty">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── DAY VIEW ── */}
        {view === "day" && (
          <div className="cal-day-view">
            <div className="cal-day-view-header">
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
                {formatDateLong(currentDate)}
              </h2>
              <button
                className="cal-add-day-btn"
                onClick={() => openScheduleModal(currentDate)}
              >
                <Plus size={14} /> {canManage ? "Add Meeting" : "Book Meeting"}
              </button>
            </div>

            {/* Speaking Events for this day */}
            {eventsForDay(currentDate).length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "750", color: "#92400e", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Sparkles size={16} /> Events &amp; Engagements Today
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {eventsForDay(currentDate).map((ev) => (
                    <div
                      key={ev._id}
                      onClick={() => {
                        setSelectedEvent(ev);
                        setShowEventModal(true);
                      }}
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: "12px",
                        padding: "1rem 1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: "800", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "999px" }}>
                            {ev.category || "Event"}
                          </span>
                          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#92400e" }}>
                            {ev.time}
                          </span>
                        </div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#78350f", margin: "0 0 0.25rem" }}>
                          {ev.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#a16207" }}>
                          📍 {ev.venue} • {ev.clientRole || "Attendee"}
                        </p>
                      </div>
                      <button
                        className="button button-rust"
                        style={{ fontSize: "0.8rem", padding: "6px 14px", minHeight: "34px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                          setShowEventModal(true);
                        }}
                      >
                        View & Reserve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meetings for this day */}
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "750", color: "var(--ink, #173a32)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Clock size={16} /> Consultations & Scheduled Meetings
              </h3>
              {meetingsForDay(currentDate).length === 0 && eventsForDay(currentDate).length === 0 && (
                <div className="cal-empty-state">
                  <CalIcon size={40} style={{ color: "#cbd5e1" }} />
                  <p>No meetings or events scheduled for this day.</p>
                  <button
                    className="button button-rust"
                    style={{ marginTop: "0.75rem", fontSize: "0.85rem", minHeight: "40px" }}
                    onClick={() => openScheduleModal(currentDate)}
                  >
                    <Plus size={14} /> {canManage ? "Schedule a Meeting" : "Book a Consultation"}
                  </button>
                </div>
              )}
              {meetingsForDay(currentDate).map((m) => (
                <button
                  key={m._id}
                  className="cal-day-event-card"
                  onClick={() => {
                    setSelectedMeeting(m);
                    setShowDetailModal(true);
                  }}
                >
                  <div
                    className="cal-day-event-bar"
                    style={{ background: STATUS_STYLES[m.status]?.color || "#1d4ed8" }}
                  />
                  <div className="cal-day-event-content">
                    <div className="cal-day-event-header">
                      <h3 className="cal-day-event-title">{m.title}</h3>
                      <span
                        className="cal-status-badge"
                        style={{
                          background: STATUS_STYLES[m.status]?.bg,
                          color: STATUS_STYLES[m.status]?.color,
                        }}
                      >
                        {STATUS_STYLES[m.status]?.label}
                      </span>
                    </div>
                    <div className="cal-day-event-meta">
                      <span>
                        <Clock size={13} /> {formatTime(new Date(m.startTime))} –{" "}
                        {formatTime(new Date(m.endTime))} ({m.duration} min)
                      </span>
                      {m.clientName && (
                        <span>
                          <User size={13} /> {m.clientName}
                        </span>
                      )}
                      {m.location && (
                        <span>
                          <MapPin size={13} /> {m.location}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ──────── Selected Date Sidebar (for month/week views) ──────── */}
      {(view === "month" || view === "week") && (
        <div className="cal-sidebar" style={{ marginTop: "1.5rem" }}>
          <div className="cal-sidebar-header">
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
              {formatDateLong(selectedDate)}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="button button-rust"
                style={{ fontSize: "0.8rem", padding: "4px 12px", minHeight: "32px" }}
                onClick={() => openScheduleModal(selectedDate)}
              >
                <Plus size={14} /> {canManage ? "Schedule" : "Book"}
              </button>
            </div>
          </div>

          {/* Speaking events on selected date */}
          {eventsForSelectedDate.length > 0 && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", color: "#b45309", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Events ({eventsForSelectedDate.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {eventsForSelectedDate.map((ev) => (
                  <div
                    key={ev._id}
                    onClick={() => {
                      setSelectedEvent(ev);
                      setShowEventModal(true);
                    }}
                    style={{
                      padding: "0.85rem",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: "750", color: "#78350f" }}>
                        {ev.title}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", background: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: "4px" }}>
                        {ev.time}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#a16207" }}>
                      📍 {ev.venue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meetings on selected date */}
          <div style={{ fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Scheduled Meetings ({meetingsForSelectedDate.length})
          </div>
          {meetingsForSelectedDate.length === 0 && eventsForSelectedDate.length === 0 ? (
            <div className="cal-empty-state">
              <CalIcon size={36} style={{ color: "#cbd5e1" }} />
              <p>No scheduled events or meetings on this day.</p>
              <button
                className="button button-rust"
                style={{ marginTop: "0.5rem", fontSize: "0.85rem", minHeight: "38px" }}
                onClick={() => openScheduleModal(selectedDate)}
              >
                <Plus size={14} /> {canManage ? "Schedule a Meeting" : "Book a Consultation"}
              </button>
            </div>
          ) : (
            meetingsForSelectedDate.map((m) => (
              <div
                key={m._id}
                className="cal-sidebar-item"
                onClick={() => {
                  setSelectedMeeting(m);
                  setShowDetailModal(true);
                }}
              >
                <div
                  className="cal-sidebar-item-dot"
                  style={{ background: STATUS_STYLES[m.status]?.color || "#1d4ed8" }}
                />
                <div className="cal-sidebar-item-content">
                  <div className="cal-sidebar-item-title">{m.title}</div>
                  <div className="cal-sidebar-item-time">
                    {formatTime(new Date(m.startTime))} – {formatTime(new Date(m.endTime))}
                    {m.clientName && ` • ${m.clientName}`}
                  </div>
                </div>
                <span
                  className="cal-status-badge"
                  style={{
                    background: STATUS_STYLES[m.status]?.bg,
                    color: STATUS_STYLES[m.status]?.color,
                    fontSize: "0.7rem",
                    padding: "0.15rem 0.45rem",
                  }}
                >
                  {STATUS_STYLES[m.status]?.label}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════ MODAL: SCHEDULE / BOOK MEETING ══════════════════ */}
      {showScheduleModal && (
        <div className="cal-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div
            className="cal-modal"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cal-modal-title"
          >
            <div className="cal-modal-header">
              <div>
                <h2 id="cal-modal-title" className="cal-modal-title">
                  {isRescheduling
                    ? "Reschedule Meeting"
                    : canManage
                      ? "Schedule New Meeting"
                      : "Book Pastoral Consultation"}
                </h2>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  {canManage
                    ? "Schedule an appointment with a client or delegate."
                    : "Session with Ven. Dr. Victor Akpevwen Onosemuode (Rtd.)"}
                </p>
              </div>
              <button
                className="cal-modal-close"
                onClick={() => setShowScheduleModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitMeeting} className="cal-form">
              {/* Title */}
              <div className="cal-field">
                <label className="cal-label" htmlFor="m-title">
                  Meeting / Consultation Title *
                </label>
                <input
                  id="m-title"
                  className="cal-input"
                  type="text"
                  placeholder="e.g. Pastoral Counseling & Mentorship Session"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              {/* Client selection (admin/manager only) */}
              {canManage && (
                <div className="cal-field">
                  <label className="cal-label">Select Client *</label>
                  <input
                    type="text"
                    className="cal-input"
                    placeholder="Search client by email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    style={{ marginBottom: "0.5rem" }}
                  />
                  <select
                    className="cal-select"
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a registered client --</option>
                    {filteredClients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.email} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Start Time */}
              <div className="cal-field-row">
                <div className="cal-field">
                  <label className="cal-label" htmlFor="m-date">
                    Date *
                  </label>
                  <input
                    id="m-date"
                    className="cal-input"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="cal-field">
                  <label className="cal-label" htmlFor="m-time">
                    Start Time *
                  </label>
                  <input
                    id="m-time"
                    className="cal-input"
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Conflict warning */}
              {isTimeConflicting(formStartTime) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.85rem",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    color: "#dc2626",
                    fontSize: "0.82rem",
                  }}
                >
                  <AlertCircle size={15} />
                  <span>This slot conflicts with an existing booking. Please pick another time.</span>
                </div>
              )}

              {/* Duration */}
              <div className="cal-field">
                <label className="cal-label">Duration</label>
                <div className="cal-duration-options">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      className={`cal-duration-btn${formDuration === d.value ? " cal-duration-active" : ""}`}
                      onClick={() => setFormDuration(d.value)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meeting Type / Location */}
              <div className="cal-field">
                <label className="cal-label" htmlFor="m-location">
                  Meeting Type / Location
                </label>
                <input
                  id="m-location"
                  className="cal-input"
                  type="text"
                  placeholder="e.g. Google Meet (Virtual), Phone Call, or Warri Parish Office"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                />
              </div>

              {/* Notes / Prayer Request */}
              <div className="cal-field">
                <label className="cal-label" htmlFor="m-notes">
                  Notes / Consultation Topic
                </label>
                <textarea
                  id="m-notes"
                  className="cal-textarea"
                  rows={3}
                  placeholder="Briefly describe what you'd like to discuss or pray about..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              {/* Preview */}
              {endTimePreview && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    color: "#475569",
                  }}
                >
                  <strong>Scheduled Slot Preview:</strong>
                  <div style={{ whiteSpace: "pre-line", marginTop: "0.2rem", fontWeight: "600", color: "#0f172a" }}>
                    {endTimePreview}
                  </div>
                </div>
              )}

              {/* Notice for non-admin clients */}
              {!canManage && (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    padding: "0.65rem 0.85rem",
                    fontSize: "0.82rem",
                    color: "#92400e",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Pending Approval:</strong> Consultation requests are placed on <em>Pending Approval</em> until confirmed by Ven. Victor Onosemuode (Rtd.) or the admin team.
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="cal-form-actions" style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setShowScheduleModal(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-rust"
                  disabled={formSubmitting || isTimeConflicting(formStartTime)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  {formSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isRescheduling
                    ? "Update Meeting"
                    : canManage
                      ? "Confirm Meeting"
                      : "Submit Consultation Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL: SPEAKING EVENT DETAILS ══════════════════ */}
      {showEventModal && selectedEvent && (
        <div className="cal-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div
            className="cal-modal"
            style={{ maxWidth: "680px", padding: "0", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* 50% Poster layout in Modal */}
            <div style={{ position: "relative", minHeight: "240px", background: "#173a32" }}>
              <Image
                src={selectedEvent.posterImage || "/annual-vestry-meeting-poster.png"}
                alt={selectedEvent.title}
                fill
                style={{ objectFit: "cover", opacity: 0.9 }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(20,40,34,0.85) 100%)" }} />

              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "rgba(0,0,0,0.6)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>

              <div style={{ position: "absolute", bottom: "1.25rem", left: "1.5rem", right: "1.5rem", color: "#ffffff" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", background: "var(--rust, #a64b32)", padding: "3px 9px", borderRadius: "999px", display: "inline-block", marginBottom: "0.5rem" }}>
                  {selectedEvent.category || "Event"}
                </span>
                <h2 style={{ fontSize: "1.35rem", fontWeight: "750", margin: "0", lineHeight: "1.25" }}>
                  {selectedEvent.title}
                </h2>
              </div>
            </div>

            <div style={{ padding: "1.75rem" }}>
              {selectedEvent.theme && (
                <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#f8f7f1", borderRadius: "8px", borderLeft: "3px solid var(--rust)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "var(--rust)", letterSpacing: "0.05em" }}>
                    Theme
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--ink, #173a32)", marginTop: "0.2rem" }}>
                    &ldquo;{selectedEvent.theme}&rdquo;
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", color: "#334155" }}>
                  <CalIcon size={16} style={{ color: "var(--rust)" }} />
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Date & Time</div>
                    <strong>{selectedEvent.date} • {selectedEvent.time}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", color: "#334155" }}>
                  <MapPin size={16} style={{ color: "var(--rust)" }} />
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Venue</div>
                    <strong>{selectedEvent.venue}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", color: "#334155" }}>
                  <Sparkles size={16} style={{ color: "var(--rust)" }} />
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Role</div>
                    <strong>{selectedEvent.clientRole || "Attendee"}</strong>
                  </div>
                </div>
              </div>

              {selectedEvent.description && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: "1.6", color: "#475569" }}>
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Seats: <strong>{selectedEvent.reservedSeats || 0}</strong> / {selectedEvent.capacity || 200} Reserved
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => setShowEventModal(false)}
                  >
                    Close
                  </button>
                  <Link
                    href="/events"
                    className="button button-rust"
                    onClick={() => setShowEventModal(false)}
                  >
                    <Ticket size={16} /> Reserve Seat on Events Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL: MEETING DETAILS ══════════════════ */}
      {showDetailModal && selectedMeeting && (
        <div className="cal-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div
            className="cal-modal"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="cal-modal-header">
              <h2 className="cal-modal-title">{selectedMeeting.title}</h2>
              <button
                className="cal-modal-close"
                onClick={() => setShowDetailModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "1rem 0 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  className="cal-status-badge"
                  style={{
                    background: STATUS_STYLES[selectedMeeting.status]?.bg,
                    color: STATUS_STYLES[selectedMeeting.status]?.color,
                  }}
                >
                  {STATUS_STYLES[selectedMeeting.status]?.label}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Duration: {selectedMeeting.duration} mins
                </span>
              </div>

              <div style={{ padding: "0.85rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "#1e293b", fontWeight: "600", fontSize: "0.9rem" }}>
                  <Clock size={16} style={{ color: "var(--rust)" }} />
                  {formatDateLong(new Date(selectedMeeting.startTime))}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#475569", paddingLeft: "1.5rem" }}>
                  {formatTime(new Date(selectedMeeting.startTime))} – {formatTime(new Date(selectedMeeting.endTime))} ({selectedMeeting.timezone})
                </div>
              </div>

              {selectedMeeting.clientName && (
                <div style={{ fontSize: "0.88rem", color: "#334155" }}>
                  <strong>Client / Attendee:</strong> {selectedMeeting.clientName} ({selectedMeeting.clientEmail})
                </div>
              )}

              {selectedMeeting.location && (
                <div style={{ fontSize: "0.88rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={15} style={{ color: "var(--rust)" }} />
                  <strong>Location:</strong> {selectedMeeting.location}
                </div>
              )}

              {selectedMeeting.status === "pending" && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.75rem 1rem", color: "#92400e", fontSize: "0.84rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Status: Pending Approval</strong> — This consultation request is awaiting review by the admin/manager. Meeting links and calendar export will become active upon approval.
                  </div>
                </div>
              )}

              {selectedMeeting.notes && (
                <div style={{ fontSize: "0.88rem", color: "#475569", padding: "0.6rem 0.85rem", background: "#f8f7f1", borderRadius: "6px" }}>
                  <strong>Notes:</strong> {selectedMeeting.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
              {/* Only show export if meeting is confirmed */}
              {selectedMeeting.status !== "pending" && selectedMeeting.status !== "cancelled" && (
                <>
                  <button
                    type="button"
                    className="button button-ghost"
                    style={{ fontSize: "0.82rem" }}
                    onClick={() => handleDownloadICS(selectedMeeting)}
                  >
                    <Download size={14} /> Download .ICS
                  </button>
                  <a
                    href={getGoogleCalURL(selectedMeeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-ghost"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <ExternalLink size={14} /> Add to Google Calendar
                  </a>
                </>
              )}

              {/* Admin actions for pending meeting */}
              {canManage && selectedMeeting.status === "pending" && (
                <>
                  <button
                    type="button"
                    className="button"
                    style={{ fontSize: "0.82rem", background: "#16a34a", color: "#ffffff", border: "none", padding: "0.45rem 1rem" }}
                    onClick={() => handleApproveMeeting(selectedMeeting._id)}
                  >
                    ✓ Approve Request
                  </button>
                  <button
                    type="button"
                    className="button"
                    style={{ fontSize: "0.82rem", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "0.45rem 1rem" }}
                    onClick={() => handleDeclineMeeting(selectedMeeting._id)}
                  >
                    ✕ Decline Request
                  </button>
                </>
              )}

              {canManage && selectedMeeting.status === "scheduled" && (
                <>
                  <button
                    type="button"
                    className="button button-ghost"
                    style={{ fontSize: "0.82rem" }}
                    onClick={() => openReschedule(selectedMeeting)}
                  >
                    <RotateCcw size={14} /> Reschedule
                  </button>
                  <button
                    type="button"
                    className="button"
                    style={{ fontSize: "0.82rem", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}
                    onClick={() => setShowCancelModal(true)}
                  >
                    <Trash2 size={14} /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL: CANCEL MEETING ══════════════════ */}
      {showCancelModal && (
        <div className="cal-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div
            className="cal-modal"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="cal-modal-header">
              <h2 className="cal-modal-title" style={{ color: "#b91c1c" }}>Cancel Meeting</h2>
              <button
                className="cal-modal-close"
                onClick={() => setShowCancelModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Are you sure you want to cancel this meeting? This will mark the meeting as cancelled.
            </p>
            <div className="cal-field" style={{ margin: "1rem 0" }}>
              <label className="cal-label">Cancellation Reason (optional)</label>
              <input
                className="cal-input"
                type="text"
                placeholder="e.g. Rescheduled due to urgent diocesan commitment"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Back
              </button>
              <button
                type="button"
                className="button"
                style={{ background: "#dc2626", color: "#ffffff" }}
                onClick={handleCancelMeeting}
                disabled={cancelling}
              >
                {cancelling && <Loader2 size={15} className="animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
