import React from "react";
import { useWeatherInfo } from "@/providers/WeatherInfoProvider";



export const WeatherWidget: React.FC = () => {
  const { weather, loading, error } = useWeatherInfo();

  if (loading) {
    return (
      <div className="glass-panel w-full max-w-xs flex flex-col items-center justify-center space-y-4 py-8">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
        </div>
        <span className="text-sm text-muted animate-pulse">Fetching weather data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel w-full max-w-xs text-center p-6">
        <span className="text-red-400">Failed to load data: {error}</span>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full max-w-xs">
      <div className="flex items-center space-x-4 mb-4">
        <img src={`https://openweathermap.org/img/wn/${weather?.weather[0]?.icon}.png`} alt={weather?.weather[0]?.main} className="w-16 h-16" />
        <div className="flex flex-col flex-1">
          <span className="text-lg font-semibold text-gradient">
            {weather?.name}
          </span>
          <span className="text-4xl font-light mt-1 shimmer">
            {`${weather?.main.temp}`} °C
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="glass-card p-3 flex justify-between items-center">
          <span className="text-sm text-muted">Temperature</span>
          <span className="text-sm font-semibold capitalize">{weather?.main.temp}</span>
        </div>

        <div className="glass-card p-3 flex justify-between items-center">
          <span className="text-sm text-muted">Humidity</span>
          <span className="text-sm font-semibold">{weather?.main.humidity}%</span>
        </div>

        <div className="glass-card p-3 flex justify-between items-center">
          <span className="text-sm text-muted">Wind</span>
          <span className="text-sm font-semibold">
            {weather?.wind.speed} km/h
          </span>
        </div>
      </div>
    </div>
  );
};
