import { createContext } from "react";

interface CalendarContextType {
  id: string;
  title: string;
  date: Date;
  time?: string;
  color?: string;
}

const CalendarContext = createContext<CalendarContextType>({
  lat: null,
  lon: null,
  tz: null,
  date: null,
  units: null,
  weather_overview: null,
});

export const CalendarProvider: React.FC = () => {
  //api.openweathermap.org/data/3.0/onecall/overview?lon=-11.8092&lat=51.509865&appid={API key}
  https: useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser.",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toLocaleString();
        setLocation({ latitude, longitude, timestamp, error: null });
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          error: error.message,
        }));
      },
    );
  }, []);

  const MOCK_UNIT = "metric";
  const url = new URL(
    " https://api.openweathermap.org/data/3.0/onecall/day_summary",
  );

  new Date().format();

  YYYY - MM - DD;
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("date", date);
  url.searchParams.set("appid", key);
};
