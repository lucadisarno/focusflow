import { useEffect, useState, useCallback } from "react";
import { Calendar, Views, type View } from "react-big-calendar";
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { useNavigate } from "react-router-dom";
import { taskApi, type CalendarEvent } from "@/lib/api";
import { localizer } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// ─── Calendario con DnD ───────────────────────────────────
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

// ─── Config status / priority ─────────────────────────────
const statusConfig = {
  TODO:        { label: "Da fare",    emoji: "⏳" },
  IN_PROGRESS: { label: "In corso",   emoji: "🔄" },
  DONE:        { label: "Completato", emoji: "✅" },
};

const priorityConfig = {
  LOW:    { label: "Bassa",  className: "bg-slate-100 text-slate-600" },
  MEDIUM: { label: "Media",  className: "bg-yellow-100 text-yellow-700" },
  HIGH:   { label: "Alta",   className: "bg-red-100 text-red-700" },
};

// ─── Popover dettagli evento ──────────────────────────────
function EventPopover({ event }: { event: CalendarEvent }) {
  const navigate = useNavigate();
  const { resource } = event;

  return (
    <div className="space-y-3 min-w-[220px]">
      <div className="font-medium text-sm">{event.title}</div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{statusConfig[resource.status]?.emoji}</span>
        <span>{statusConfig[resource.status]?.label}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[resource.priority]?.className}`}>
          {priorityConfig[resource.priority]?.label}
        </span>

        {resource.categoryName && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${resource.categoryColor}20`,
              color: resource.categoryColor,
            }}
          >
            {resource.categoryName}
          </span>
        )}
      </div>

      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs"
        onClick={() => navigate("/tasks")}
      >
        Vai ai Task →
      </Button>
    </div>
  );
}

// ─── Componente principale ────────────────────────────────
export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fetchEvents = useCallback(async (currentDate: Date) => {
    setLoading(true);
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const end   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
      const data  = await taskApi.getCalendarEvents(start, end);

      const parsed = data.map((e) => ({
        ...e,
        start: new Date(e.start),
        end:   new Date(e.end),
      }));
      setEvents(parsed);
    } catch (err) {
      console.error("Errore caricamento eventi calendario", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(date);
  }, [date, fetchEvents]);

  // ─── Color coding per categoria ───────────────────────────
  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const color = event.resource?.categoryColor ?? "#6366f1";
    const isDone = event.resource?.status === "DONE";
    return {
      style: {
        backgroundColor: isDone ? "#e5e7eb" : `${color}22`,
        borderLeft: `3px solid ${isDone ? "#9ca3af" : color}`,
        color: isDone ? "#6b7280" : color,
        borderRadius: "4px",
        fontSize: "12px",
        padding: "2px 6px",
        textDecoration: isDone ? "line-through" : "none",
        opacity: isDone ? 0.7 : 1,
        cursor: "grab",
      },
    };
  }, []);

  // ─── Click su evento → apri popover ──────────────────────
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (dragging) return; // non aprire popover durante il drag
    setSelectedEvent(event);
    setPopoverOpen(true);
  }, [dragging]);

  // ─── Drag & drop: aggiorna dueDate sul backend ────────────
  const handleEventDrop = useCallback(
    async ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
      setDragging(false);
      const newDate = start instanceof Date ? start : new Date(start);

      // Aggiorna ottimisticamente la UI
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, start: newDate, end: newDate }
            : e
        )
      );

      // Chiama il backend
      try {
        await taskApi.update(event.id, {
          dueDate: newDate.toISOString(),
        });
      } catch (err) {
        console.error("Errore aggiornamento data task", err);
        // Rollback in caso di errore
        fetchEvents(date);
      }
    },
    [date, fetchEvents]
  );

  // ─── Resize evento (stessa logica del drop) ───────────────
  const handleEventResize = useCallback(
    async ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
      const newDate = start instanceof Date ? start : new Date(start);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, start: newDate, end: newDate }
            : e
        )
      );
      try {
        await taskApi.update(event.id, {
          dueDate: newDate.toISOString(),
        });
      } catch (err) {
        console.error("Errore resize task", err);
        fetchEvents(date);
      }
    },
    [date, fetchEvents]
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualizza i tuoi task con scadenza
          </p>
        </div>
        {loading && (
          <span className="text-sm text-muted-foreground animate-pulse">
            Caricamento...
          </span>
        )}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-200 border-l-2 border-indigo-500 inline-block" />
          Task con categoria
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-200 border-l-2 border-gray-400 inline-block" />
          Completati
        </span>
        <span>⏳ Da fare &nbsp; 🔄 In corso &nbsp; ✅ Completato</span>
        <span className="flex items-center gap-1.5">
          🖱️ Trascina un task per cambiare la scadenza
        </span>
      </div>

      {/* Calendario */}
      <Card className="p-4 overflow-hidden">
        {selectedEvent && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <span className="hidden" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" side="top">
              <EventPopover event={selectedEvent} />
            </PopoverContent>
          </Popover>
        )}

        <DnDCalendar
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onView={setView}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onDragStart={() => setDragging(true)}
          eventPropGetter={eventPropGetter}
          resizable
          style={{ height: 600 }}
          messages={{
            next:             "Avanti",
            previous:         "Indietro",
            today:            "Oggi",
            month:            "Mese",
            week:             "Settimana",
            day:              "Giorno",
            agenda:           "Agenda",
            date:             "Data",
            time:             "Ora",
            event:            "Evento",
            noEventsInRange:  "Nessun task con scadenza in questo periodo.",
          }}
          formats={{
            monthHeaderFormat: (date) =>
              date.toLocaleDateString("it-IT", { month: "long", year: "numeric" }),
            dayHeaderFormat: (date) =>
              date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }),
            dayRangeHeaderFormat: ({ start, end }) =>
              `${start.toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}`,
          }}
        />
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        💡 Clicca su un task per i dettagli. Trascinalo su un altro giorno per cambiare la scadenza.
      </p>
    </div>
  );
}