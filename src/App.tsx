// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import { WeatherWidget } from "./components/WeatherWidget";

const mockWeather = {
  location: "Santa Barbara, CA",
  temperature: 22, // °C
  feelsLike: 23,
  humidity: 65, // %
  condition: "Partly Cloudy",
  icon: "https://openweathermap.org/img/wn/03d.png",
  windSpeed: 10, // km/h
  windDirection: "NW",
  timestamp: new Date().toISOString(),
};

function App() {
  return (
    <div>
      <WeatherWidget weather={mockWeather}></WeatherWidget>
    </div>
  );
}

export default App;
