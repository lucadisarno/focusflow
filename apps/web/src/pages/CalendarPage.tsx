import { useEffect, useState, useCallback } from "react";
import { Calendar, Views, type View } from "react-big-calendar";
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { useNavigate } from "react-router-dom";
import { taskApi, type CalendarEvent } from "@/lib/api";
import { localizer } from "@/lib/calendar";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { CheckSquare, RefreshCw, Circle, ArrowRight, Loader2 } from "lucide-react";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// ─── Calendario con DnD ───────────────────────────────────
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

// ─── Config status ────────────────────────────────────────
const statusConfig = {
  TODO:        { label: "Da fare",    bg: "var(--ff-amber-light)",  color: "var(--ff-amber-dark)",  icon: Circle },
  IN_PROGRESS: { label: "In corso",   bg: "var(--ff-violet-light)", color: "var(--ff-violet)",      icon: RefreshCw },
  DONE:        { label: "Completato", bg: "var(--ff-teal-light)",   color: "var(--ff-teal)",        icon: CheckSquare },
};

const priorityConfig = {
  LOW:    { label: "Bassa",  bg: "var(--ff-sand)",         color: "var(--color-muted-foreground)" },
  MEDIUM: { label: "Media",  bg: "var(--ff-amber-light)",  color: "var(--ff-amber-dark)" },
  HIGH:   { label: "Alta",   bg: "var(--ff-coral-light)",  color: "var(--ff-coral)" },
};

// ─── Popover dettagli evento ──────────────────────────────
function EventPopover({ event }: { event: CalendarEvent }) {
  const navigate = useNavigate();
  const { resource } = event;
  const status   = statusConfig[resource.status]   ?? statusConfig.TODO;
  const priority = priorityConfig[resource.priority] ?? priorityConfig.MEDIUM;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-3 min-w-[220px]">
      {/* Titolo */}
      <p className="text-sm font-medium text-foreground leading-snug">
        {event.title}
      </p>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ backgroundColor: status.bg, color: status.color }}
        >
          <StatusIcon size={11} />
          {status.label}
        </span>
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ backgroundColor: priority.bg, color: priority.color }}
        >
          {priority.label}
        </span>
      </div>

      {/* Categoria */}
      {resource.categoryName && (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium"
          style={{
            backgroundColor: `${resource.categoryColor}15`,
            color: resource.categoryColor,
          }}
        >
          {resource.categoryName}
        </span>
      )}

      {/* Tag */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
              style={{ borderColor: "var(--border)", color: "var(--color-muted-foreground)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => navigate("/tasks")}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2
                   rounded-[--radius-pill] text-xs font-medium border border-border
                   text-foreground hover:bg-muted transition-colors duration-150"
      >
        Vai ai Task
        <ArrowRight size={12} />
      </button>
    </div>
  );
}

// ─── CALENDAR PAGE ────────────────────────────────────────
export function CalendarPage() {
  const [events, setEvents]               = useState<CalendarEvent[]>([]);
  const [loading, setLoading]             = useState(true);
  const [view, setView]                   = useState<View>(Views.MONTH);
  const [date, setDate]                   = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popoverOpen, setPopoverOpen]     = useState(false);
  const [dragging, setDragging]           = useState(false);

  const fetchEvents = useCallback(async (currentDate: Date) => {
    setLoading(true);
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const end   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
      const data  = await taskApi.getCalendarEvents(start, end);
      const parsed: CalendarEvent[] = data.map((e) => ({
        ...e,
        start: new Date(e.start as unknown as string),
        end:   new Date(e.end   as unknown as string),
      }));
      setEvents(parsed);
    } catch (err) {
      console.error("Errore caricamento eventi calendario", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(date); }, [date, fetchEvents]);

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const color  = event.resource?.categoryColor ?? "var(--ff-violet)";
    const isDone = event.resource?.status === "DONE";
    return {
      style: {
        backgroundColor: isDone ? "var(--ff-sand)" : `${color}20`,
        borderLeft:      `3px solid ${isDone ? "var(--ff-sand-dark)" : color}`,
        color:           isDone ? "var(--color-muted-foreground)" : color,
        borderRadius:    "6px",
        fontSize:        "12px",
        padding:         "2px 6px",
        textDecoration:  isDone ? "line-through" : "none",
        opacity:         isDone ? 0.65 : 1,
        cursor:          "grab",
        border:          "none",
        borderLeftWidth: "3px",
        borderLeftStyle: "solid" as const,
        borderLeftColor: isDone ? "var(--ff-sand-dark)" : color,
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (dragging) return;
    setSelectedEvent(event);
    setPopoverOpen(true);
  }, [dragging]);

  const handleEventDrop = useCallback(
    async ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
      setDragging(false);
      const newDate = start instanceof Date ? start : new Date(start);
      setEvents((prev) =>
        prev.map((e) => e.id === event.id ? { ...e, start: newDate, end: newDate } : e)
      );
      try {
        await taskApi.update(event.id, { dueDate: newDate.toISOString() });
      } catch (err) {
        console.error("Errore aggiornamento data task", err);
        fetchEvents(date);
      }
    },
    [date, fetchEvents]
  );

  const handleEventResize = useCallback(
    async ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
      const newDate = start instanceof Date ? start : new Date(start);
      setEvents((prev) =>
        prev.map((e) => e.id === event.id ? { ...e, start: newDate, end: newDate } : e)
      );
      try {
        await taskApi.update(event.id, { dueDate: newDate.toISOString() });
      } catch (err) {
        console.error("Errore resize task", err);
        fetchEvents(date);
      }
    },
    [date, fetchEvents]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Pianificazione
          </p>
          <h1 className="font-display text-3xl text-foreground">Calendario</h1>
          <p className="text-sm text-muted-foreground">
            Visualizza i tuoi task con scadenza
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Caricamento...
          </div>
        )}
      </div>

      {/* ── Legenda ── */}
      <div
        className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-[--radius-lg]
                   border border-border text-xs text-muted-foreground"
        style={{ backgroundColor: "var(--ff-warm-bg)" }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{
              backgroundColor: "var(--ff-violet-light)",
              borderLeft: "3px solid var(--ff-violet)",
            }}
          />
          Task con categoria
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{
              backgroundColor: "var(--ff-sand)",
              borderLeft: "3px solid var(--ff-sand-dark)",
            }}
          />
          Completati
        </span>
        <span className="flex items-center gap-1.5">
          <Circle size={11} style={{ color: "var(--ff-amber)" }} /> Da fare
        </span>
        <span className="flex items-center gap-1.5">
          <RefreshCw size={11} style={{ color: "var(--ff-violet)" }} /> In corso
        </span>
        <span className="flex items-center gap-1.5">
          <CheckSquare size={11} style={{ color: "var(--ff-teal)" }} /> Completato
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          🖱️ Trascina per cambiare scadenza
        </span>
      </div>

      {/* ── Calendario ── */}
      <div
        className="rounded-[--radius-xl] border border-border overflow-hidden"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        {selectedEvent && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger>
              <span className="hidden" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 rounded-[--radius-xl]" side="top">
              <EventPopover event={selectedEvent} />
            </PopoverContent>
          </Popover>
        )}

        <div className="p-4">
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onDragStart={() => setDragging(true)}
            eventPropGetter={eventPropGetter}
            resizable
            style={{ height: 600 }}
            messages={{
              next:            "Avanti",
              previous:        "Indietro",
              today:           "Oggi",
              month:           "Mese",
              week:            "Settimana",
              day:             "Giorno",
              agenda:          "Agenda",
              date:            "Data",
              time:            "Ora",
              event:           "Evento",
              noEventsInRange: "Nessun task con scadenza in questo periodo.",
            }}
            formats={{
              monthHeaderFormat: (d) =>
                d.toLocaleDateString("it-IT", { month: "long", year: "numeric" }),
              dayHeaderFormat: (d) =>
                d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }),
              dayRangeHeaderFormat: ({ start, end }) =>
                `${start.toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}`,
            }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Clicca su un task per i dettagli · Trascinalo su un altro giorno per cambiare la scadenza
      </p>
    </div>
  );
}