import React, { useState } from "react";

import { WeatherWidget } from "./components/WeatherWidget";
import { ClockWidget } from "./components/ClockWidget";
import { CalendarWidget } from "./components/CalendarWidget";
import { NewsProvider } from "./providers/NewsProvider";
import { GestureProvider } from "./providers/GestureProvider";
import { WeatherInfoProvider } from '@/providers/WeatherInfoProvider';
import { NewsWidget } from "./components/newsWidget";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const mockEvents = [
  {
    id: "1",
    title: "Team Meeting",
    date: today,
    time: "10:00 AM",
    color: "#60a5fa",
  },
  {
    id: "2",
    title: "Lunch with Client",
    date: today,
    time: "12:30 PM",
    color: "#a78bfa",
  },
  {
    id: "3",
    title: "Project Review",
    date: tomorrow,
    time: "2:00 PM",
    color: "#f472b6",
  },
  {
    id: "4",
    title: "Gym Session",
    date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
    time: "6:00 PM",
    color: "#34d399",
  },
  {
    id: "5",
    title: "Dentist Appointment",
    date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
    time: "9:30 AM",
    color: "#fbbf24",
  },
  {
    id: "6",
    title: "Conference Call",
    date: nextWeek,
    time: "3:00 PM",
    color: "#60a5fa",
  },
];

function App() {
  const [mirror, setMirror] = useState(false);
  const [flash, setFlash] = useState<null | "hide" | "show">(null);

  const showFlash = (t: "hide" | "show") => {
    setFlash(t);
    setTimeout(() => setFlash(null), 700);
  };

  return (
    <GestureProvider
      framesConfirm={4}          // steadier detection
      cooldownMs={2500}          // prevents flicker
      onOpenHand={() => {        // 🖐 4–5 fingers → hide UI
        setMirror(true);
        showFlash("hide");
      }}
      onFist={() => {            // ✊ 0–1 fingers → show UI
        setMirror(false);
        showFlash("show");
      }}
    >
      {/* Fade entire UI when in mirror mode */}
      <div className={`transition-opacity duration-300 ${mirror ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-6xl w-full">
              {/* Widget Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <WeatherInfoProvider>
                  <WeatherWidget />
                </WeatherInfoProvider>
                <ClockWidget />
                <CalendarWidget events={mockEvents} />
                <NewsProvider>
                  <NewsWidget />
                </NewsProvider>
              </div>

              {/* Demo Section */}
              <div className="glass-panel text-center">
                <h2 className="text-3xl font-bold mb-4 text-gradient">
                  Beautiful Glassmorphism
                </h2>
                <p className="text-muted mb-6 max-w-2xl mx-auto">
                  This theme features frosted glass effects, smooth animations, and a modern
                  aesthetic that creates depth and visual interest. Every element is designed
                  to feel premium and interactive.
                </p>
                <button className="glass-button">Get Started</button>
              </div>
            </div>
          </div>
      </div>

      {/* Tiny badge to confirm triggers */}
      {flash && (
        <div
          className="fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg"
          style={{ background: "rgba(30, 58, 138, 0.85)", color: "white" }}
        >
          {flash === "hide" ? "🖐 Hide (open hand)" : "✊ Show (fist)"}
        </div>
      )}
    </GestureProvider>
  );
}

export default App;
