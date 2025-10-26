import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface TravelInfo {
  method: string;
  duration: number;
  distance: number;
}
interface TravelTimeContextType {
  travelTime: TravelInfo[] | null;
  loading: boolean;
  error: string | null;
}

const TravelMode = {
  DRIVING: "DRIVING",
  TRANSIT: "TRANSIT",
  BICYCLING: "BICYCLING",
  WALKING: "WALKING",
};

const TravelTimeContext = createContext<TravelTimeContextType | null>(null);

const MOCK_LOCATION = ["UCSB", "UCS"];

export const TravelTimeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const BASE_URL = "https://www.google.com/maps/dir/?api=1";

  const [travelTime, setTravelTime] = useState<TravelInfo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const url = new URL(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
  );
  url.searchParams.append("origin", MOCK_LOCATION[0]);
  url.searchParams.append("destination", MOCK_LOCATION[1]);
  url.searchParams.append("travelmode", "");

  await fetch(url);

  const getTravelTime = useCallback(
    async (origin: string, destination: string, mode: TravelMode = "DRIVE") => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          origins: origin,
          destinations: destination,
          key: GOOGLE_API_KEY,
          mode: mode.toLowerCase(),
        });
        const url = `${BASE_URL}?${params.toString()}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`HTTP error ${resp.status}`);
        }
        const data = await resp.json();
        if (data.status !== "OK") {
          throw new Error(`API error: ${data.status}`);
        }
        const element = data.rows[0]?.elements[0];
        if (!element || element.status !== "OK") {
          throw new Error(`Route element error: ${element?.status}`);
        }
        setDuration(element.duration.value);
        setDistance(element.distance.value);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return (
    <TravelTimeContext.Provider value={{ travelTime, loading, error }}>
      {children}
    </TravelTimeContext.Provider>
  );
};

export const useTravelTime = (): TravelTimeContextType => {
  const context = useContext(TravelTimeContext);
  if (!context) {
    throw new Error("useTravelTime must be used within TravelTimeProvider");
  }
  return context;
};
