import { useEffect, useRef, useState } from "react";

import { WeatherWidget } from "./components/WeatherWidget";
import { ClockWidget } from "./components/ClockWidget";
import { CalendarWidget } from "./components/CalendarWidget";
import { NewsProvider } from "./providers/NewsProvider";
import { GestureProvider } from "./providers/GestureProvider";
import { WeatherInfoProvider } from "./providers/WeatherInfoProvider";

import { NewsWidget } from "./components/newsWidget";      // default import
import VoiceMirror from "./components/VoiceMirror";    // default import

// ---- mock events ----
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const mockEvents = [
  { id: "1", title: "Team Meeting", date: today, time: "10:00 AM", color: "#60a5fa" },
  { id: "2", title: "Lunch with Client", date: today, time: "12:30 PM", color: "#a78bfa" },
  { id: "3", title: "Project Review", date: tomorrow, time: "2:00 PM", color: "#f472b6" },
  { id: "4", title: "Gym Session", date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), time: "6:00 PM", color: "#34d399" },
  { id: "5", title: "Dentist Appointment", date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), time: "9:30 AM", color: "#fbbf24" },
  { id: "6", title: "Conference Call", date: nextWeek, time: "3:00 PM", color: "#60a5fa" },
];

export default function App() {
  const [mirror, setMirror] = useState(false);
  const [flash, setFlash] = useState<null | "hide" | "show">(null);

  // Refs for voice navigation targets
  const weatherRef = useRef<HTMLDivElement | null>(null);
  const newsRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const clockRef = useRef<HTMLDivElement | null>(null);

  const showFlash = (t: "hide" | "show") => {
    setFlash(t);
    setTimeout(() => setFlash(null), 700);
  };

  // Voice navigation handler
  const goTo = (key: string) => {
    const map = {
      weather: weatherRef,
      news: newsRef,
      calendar: calendarRef,
      schedule: calendarRef,
      events: calendarRef,
      clock: clockRef,
      time: clockRef,
    } as const;

    const k = (key ?? "").toLowerCase() as keyof typeof map;
    const target = map[k];

    if (target?.current) {
      target.current.scrollIntoView({ behavior: "smooth", block: "center" });
      target.current.animate?.(
        [
          { outline: "2px solid rgba(255,255,255,0)", boxShadow: "none" },
          { outline: "2px solid rgba(255,255,255,0.8)", boxShadow: "0 0 0 6px rgba(255,255,255,0.15)" },
          { outline: "2px solid rgba(255,255,255,0)", boxShadow: "none" },
        ],
        { duration: 900, easing: "ease-out" }
      );
    }
  };

  // Listen for custom events from VoiceMirror
  useEffect(() => {
    const onNav = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (typeof ce.detail === "string") goTo(ce.detail);
    };
    window.addEventListener("mirror:navigate", onNav as EventListener);
    return () => window.removeEventListener("mirror:navigate", onNav as EventListener);
  }, []);

  return (
    <GestureProvider
      framesConfirm={2} // steadier detection
      cooldownMs={600} // prevents flicker
      onOpenHand={() => {
        // 🖐 4–5 fingers → hide UI
        setMirror(true);
        showFlash("hide");
      }}
      onFist={() => {
        // ✊ 0–1 fingers → show UI
        setMirror(false);
        showFlash("show");
      }}
    >
      <div style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
        {/* Fade entire UI when in mirror mode */}
        <div className={`transition-opacity duration-300 ${mirror ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          {!mirror && <VoiceMirror />}

          <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-6xl w-full">
              {/* Widget Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* WEATHER */}
                <div ref={weatherRef}>
                  <WeatherInfoProvider>
                    <WeatherWidget />
                  </WeatherInfoProvider>
                </div>

                {/* CLOCK */}
                <div ref={clockRef}>
                  <ClockWidget />
                </div>

                {/* CALENDAR */}
                <div ref={calendarRef}>
                  <CalendarWidget events={mockEvents} />
                </div>

                {/* NEWS */}
                <div ref={newsRef}>
                  <NewsProvider>
                    <NewsWidget />
                  </NewsProvider>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tiny badge to confirm gesture triggers */}
        {flash && (
          <div
            className="fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg"
            style={{ background: "rgba(30, 58, 138, 0.85)", color: "white" }}
          >
            {flash === "hide" ? "🖐 Hide (open hand)" : "✊ Show (fist)"}
          </div>
        )}
      </div>
    </GestureProvider>
  );
}
