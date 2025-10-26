import React from "react";
import { useWeatherInfo } from "@/providers/WeatherInfoProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTemperatureArrowDown } from "@fortawesome/free-solid-svg-icons";
import { faTemperatureArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faCloudRain } from "@fortawesome/free-solid-svg-icons";
import { faWind } from "@fortawesome/free-solid-svg-icons";
import { faTemperatureHalf } from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-solid-svg-icons";

export const WeatherWidget: React.FC = () => {
  const { weather, clothingSuggestion, loading, error } = useWeatherInfo();

  if (loading) {
    return (
      <div className="glass-panel w-full flex flex-col items-center justify-center space-y-4 py-8">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
        </div>
        <span className="text-sm text-muted animate-pulse">
          Fetching weather data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel w-full text-center p-6">
        <span className="text-red-400">Failed to load data: {error}</span>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full h-full">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={`https://openweathermap.org/img/wn/${weather?.weather[0]?.icon}.png`}
          alt={weather?.weather[0]?.main}
          className="w-16 h-16"
        />
        <div className="flex flex-col flex-1">
          <span className="text-lg font-semibold text-gradient">
            {weather?.name}
          </span>
          <span className="text-4xl font-light mt-1 shimmer">
            {`${weather?.main.temp}`} °F
          </span>
        </div>
      </div>
      <div className="flex gap-4 space-y-2 justify-around">
        <div>
          <FontAwesomeIcon icon={faTemperatureArrowUp} />
          {weather?.main.temp_max}
        </div>
        <div>
          <FontAwesomeIcon icon={faTemperatureArrowDown} />
          {weather?.main.temp_min}
        </div>
        {weather?.rain ? (
          <div>
            <FontAwesomeIcon icon={faCloudRain} />
            {weather?.rain?.["1h"]}
          </div>
        ) : (
          <></>
        )}
        <div>
          <FontAwesomeIcon icon={faTemperatureHalf} />
          {weather?.main.feels_like}
        </div>
        <div>
          <FontAwesomeIcon icon={faWind} />
          {weather?.wind.speed} mph
        </div>
      </div>
      <div className="mt-2">
        <FontAwesomeIcon icon={faComment} />
        {" " + clothingSuggestion}
      </div>
    </div>
  );
};
