import WeatherImage, { WeatherTypeProps } from "../weather-image"

interface CurrentWeatherProps {
  location: string
  currentHour: number
  currentDate: number
  weatherNow: WeatherTypeProps
  tempNow: number
  units: "metric" | "imperial"
  tempAndWeatherOverNextHours: { 
    temp: number, 
    weather: WeatherTypeProps
  }[]
}

const CurrentWeatherCard = ({ currentWeather }: { currentWeather: CurrentWeatherProps }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <h5 className="text-xs font-medium text-zinc-400">Weather Forecast: {currentWeather.location}</h5>
      <div className="flex flex-col shadow-md gap-4 w-full rounded-lg items-start bg-blue-400 dark:bg-zinc-900 dark:border-zinc-800 text-white p-4">
      <div className="flex flex-col gap-1">
          <h5 className="text-xs font-medium">
            {new Date(currentWeather.currentDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h5>
          <div className="flex flex-row gap-2 items-center">
            <div className="flex flex-row gap-1">
              <h2 className="text-2xl font-semibold">{Math.round(currentWeather.tempNow)}</h2><h5>{currentWeather.units === "metric" ? "°C" : "°F"}</h5>
            </div>
            <WeatherImage height={48} width={48} weather={currentWeather.weatherNow}/>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 auto-cols-min gap-4 w-full">
          {currentWeather.tempAndWeatherOverNextHours.slice(0, 7).map((hour: any, index: number) => (
            <div className="flex flex-col gap-2 items-center w-8" key={index}>
              <h5 className="text-xs text-zinc-100">
                {index === 0 ? "Now" : ((currentWeather.currentHour + index) % 24).toString().padStart(2, '0')}
              </h5>
              <WeatherImage height={32} width={32} weather={hour.weather}/>
              <div className="flex flex-row gap-[0.125rem] font-semibold items-center">
                <h4 className="font-medium">{Math.round(hour.temp)}</h4>
                <h5 className="text-xs">°</h5>
              </div>
            </div>
          ))}
      </div>
      </div>
    </div>
  )
}

export default CurrentWeatherCard