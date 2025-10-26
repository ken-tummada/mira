import React, { useState, useEffect } from "react";

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  const formattedTime = `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const date = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glass-panel w-full max-w-xs">
      <div className="text-center">
        <div className="text-5xl font-light mb-2 shimmer">{formattedTime}</div>
        <div className="text-xl font-semibold text-gradient mb-3">{ampm}</div>
        <div className="text-sm text-muted">{date}</div>
      </div>
    </div>
  );
};
