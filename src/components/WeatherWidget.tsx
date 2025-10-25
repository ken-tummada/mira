import React from "react";

export interface WeatherInfo {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  icon: string;
  windSpeed: number;
  windDirection: string;
  timestamp: string;
}

interface WeatherWidgetProps {
  weather: WeatherInfo;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  const {
    location,
    temperature,
    condition,
    icon,
    humidity,
    windSpeed,
    windDirection,
  } = weather;

  return (
    <div className="glass-panel w-full max-w-xs">
      <div className="flex items-center space-x-4 mb-4">
        <img src={icon} alt={condition} className="w-16 h-16" />
        <div className="flex flex-col flex-1">
          <span className="text-lg font-semibold text-gradient">{location}</span>
          <span className="text-4xl font-light mt-1 shimmer">{temperature}°C</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="glass-card p-3 flex justify-between items-center">
          <span className="text-sm text-muted">Condition</span>
          <span className="text-sm font-semibold capitalize">{condition}</span>
        </div>
        
        <div className="glass-card p-3 flex justify-between items-center">
          <span className="text-sm text-muted">Humidity</span>
          <span className="text-sm font-semibold">{humidity}%</span>
        </div>
        
        <div className="glass-card p-3 flex justify-between items-center">
          <span className="text-sm text-muted">Wind</span>
          <span className="text-sm font-semibold">{windSpeed} km/h {windDirection}</span>
        </div>
      </div>
    </div>
  );
};