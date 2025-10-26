import React from "react";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  color?: string;
}

interface CalendarWidgetProps {
  events?: CalendarEvent[];
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events = [],
}) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  // Filter and sort upcoming events
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Show max 5 upcoming events

  const formatDate = (date: Date) => {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return "Today";
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    }
  };

  const getDaysUntil = (date: Date) => {
    const eventDate = new Date(date);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className="glass-panel w-full max-w-md">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gradient">Upcoming Events</h3>
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => {
            const daysUntil = getDaysUntil(event.date);

            return (
              <div
                key={event.id}
                className="glass-card p-4 transition-all hover:scale-[1.02]"
                style={{
                  borderLeft: `3px solid ${event.color || "#60a5fa"}`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{event.title}</div>
                    <div className="text-sm text-muted">
                      {formatDate(event.date)}
                      {event.time && ` • ${event.time}`}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${event.color || "#60a5fa"}33`,
                        color: event.color || "#60a5fa",
                      }}
                    >
                      {daysUntil === 0 ? "Today" : `${daysUntil}d`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-muted">No upcoming events</p>
        </div>
      )}
    </div>
  );
};
