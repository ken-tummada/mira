import React, { createContext, useEffect, useState, useContext } from "react";
import type { ReactNode } from "react";

export interface WeatherInfo {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
  };
  snow?: {
    '1h'?: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface WeatherInfoContextType {
  weather: WeatherInfo | null;
  loading: boolean;
  error: string | null;
}

const WeatherInfoContext = createContext<WeatherInfoContextType>({
  weather: null,
  loading: false,
  error: null,
});

interface WeatherProviderProps {
  children: ReactNode;
  units?: "standard" | "metric" | "imperial";
}

export const WeatherInfoProvider: React.FC<WeatherProviderProps> = ({
  children,
  units = "standard",
}) => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const MOCK_UNIT = "metric";
  const MOCK_LAT = "37.803600";
  const MOCK_LON = "-122.449158";

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const date = new Date().toLocaleString().slice(0, 10);

        if (!apiKey) throw new Error("Missing OpenWeather API key");
        const url = new URL(
          "https://api.openweathermap.org/data/2.5/weather",
        );

        // console.log(date);
        url.searchParams.set("lat", MOCK_LAT);
        url.searchParams.set("lon", MOCK_LON);
        url.searchParams.set("date", date);
        url.searchParams.set("appid", apiKey);
        url.searchParams.set("units", MOCK_UNIT);

        // console.log(url);
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`API error: ${resp.status} ${resp.statusText}`);
        }
        const data = (await resp.json()) as WeatherInfo;
        console.log(data);
        setWeather(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [units]);

  return (
    <WeatherInfoContext.Provider value={{ weather, loading, error }}>
      {children}
    </WeatherInfoContext.Provider>
  );
};

export const useWeatherInfo = () => {
  const context = useContext(WeatherInfoContext);
  if (context === undefined) {
    throw new Error("useWeatherInfo must be used within a WeatherInfoProvider");
  }
  return context;
};

