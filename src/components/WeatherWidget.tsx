import React from "react";
import * as Dialog from "@radix-ui/react-dialog";

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
    feelsLike,
    humidity,
    condition,
    icon,
    windSpeed,
    windDirection,
    timestamp,
  } = weather;

  const formattedTime = new Date(timestamp).toLocaleString();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className="cursor-pointer p-4 bg-white shadow rounded-lg hover:shadow-md transition w-full max-w-xs">
          <div className="flex items-center space-x-3">
            <img src={icon} alt={condition} className="w-12 h-12" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold">{location}</span>
              <span className="text-2xl">{temperature}°C</span>
              <span className="text-sm text-gray-500 capitalize">
                {condition}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Updated: {formattedTime}
          </div>
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-80 max-w-full">
          <Dialog.Title className="text-xl font-bold mb-4">
            Weather details for {location}
          </Dialog.Title>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Temperature:</span>
              <span>{temperature}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Feels Like:</span>
              <span>{feelsLike}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Condition:</span>
              <span className="capitalize">{condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Humidity:</span>
              <span>{humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Wind:</span>
              <span>
                {windSpeed} km/h {windDirection}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last updated:</span>
              <span className="text-xs text-gray-500">{formattedTime}</span>
            </div>
          </div>
          <Dialog.Close asChild>
            <button className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
