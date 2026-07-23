import { useState, useEffect } from 'react';
import './App.css';

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchWeather(cityName) {
    if (!cityName) return;
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Try another name.');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        ...weatherData.current_weather,
        cityName: name,
        country: country,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather('Lahore');
  }, []);

  return (
    <div className="app">
      <div className="card">
        <h1>Weather</h1>
        <p className="subtitle">Check current conditions anywhere</p>

        <div className="search-box">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather(city)}
            placeholder="Search city..."
          />
          <button onClick={() => fetchWeather(city)} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {loading && (
          <div className="loader-wrap">
            <div className="loader"></div>
          </div>
        )}

        {error && <p className="status error">⚠️ {error}</p>}

        {weather && !loading && !error && (
          <div className="weather-result">
            <div className="icon">{getWeatherIcon(weather.weathercode)}</div>
            <h2>{weather.cityName}</h2>
            <p className="location-sub">{weather.country}</p>
            <p className="temp">{Math.round(weather.temperature)}°</p>
            <div className="details">
              <div className="detail-item">
                <span className="detail-label">Wind</span>
                <span className="detail-value">{weather.windspeed} km/h</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Direction</span>
                <span className="detail-value">{weather.winddirection}°</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;