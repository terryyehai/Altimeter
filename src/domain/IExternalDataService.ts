export interface WeatherData {
  temperature: number;
  weatherCode: number;
}

export interface IExternalDataService {
  getLocationName(lat: number, lon: number): Promise<string | null>;
  getWeather(lat: number, lon: number): Promise<WeatherData | null>;
}
