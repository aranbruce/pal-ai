import WeatherImage, { WeatherTypeProps } from "../weather-image"

export interface WeatherForecastProps {
  weatherForecast: Location,
  daily: WeatherForecastDayProps[]
}

interface WeatherForecastDayProps {
  dayIndex: number,
  temperatureMain: number,
  temperatureMin: number,
  temperatureMax: number,
  weather: WeatherTypeProps
  units: "metric" | "imperial"
}

const WeatherForecastCard = ({weatherForecast}: {weatherForecast: WeatherForecastProps}) => {

  // take the day and return the day of the week based on today"s date. If the day is 0, it will return today"s day of the week
  const getDayOfWeek = (day: number) => {
    if (day === 0) {
      return "Today";
    }
    const today = new Date().getDay();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[(today + day) % 7];
  }
  
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <h5 className="text-xs font-medium text-zinc-400 w-full text-center">{weatherForecast.daily.length} Day Weather Forecast</h5>
      <div className="flex flex-col gap-4 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-blue-400 dark:bg-zinc-900 w-full">
        <h4 className="text-xl text-white font-medium">{weatherForecast.daily.length} Days Weather Forecast</h4>
        {weatherForecast.daily.map((day: any, index: number) => (
          <div key={index} className="grid grid-cols-[88px_32px_56px_60px] justify-between gap:2 sm:gap-4 w-full items-center">
            <p className="text-white">{getDayOfWeek(index)}</p>
            <WeatherImage height={32} width={32} weather={day.weather}/>
            <h5 className="font-medium text-xl text-white">{Math.round(day.temperatureMain)} {day.units === "metric" ? "°C" : "°F"}</h5>
            <div className="flex flex-row gap-4 items-center text-center">
              <div className="flex flex-col gap-1 text-white">
                <p className="text-xs">Min</p>
                <p className="font-medium">{Math.round(day.temperatureMin)}°</p>
              </div>
              <div className="flex flex-col gap-1 text-white">
                <p className="text-xs">Max</p>
                <p className="font-medium">{Math.round(day.temperatureMax)}°</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherForecastCard;