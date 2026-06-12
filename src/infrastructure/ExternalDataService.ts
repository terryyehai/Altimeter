import type { IExternalDataService, WeatherData } from '../domain/IExternalDataService';

export class ExternalDataService implements IExternalDataService {
  async getLocationName(lat: number, lon: number): Promise<string | null> {
    try {
      // 使用 BigDataCloud 無須 API Key 的全域端點
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh-tw`);
      const data = await res.json();
      if (data.city || data.locality) {
        const city = data.city || data.principalSubdivision || '';
        const locality = data.locality || '';
        const combined = `${city}${locality}`;
        // 簡單優化繁體中文顯示
        return combined.replace('City', '市').replace('District', '區').replace('County', '縣').trim();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      // 使用 Open-Meteo 免費全球氣象 API
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
      const data = await res.json();
      if (data.current) {
        return {
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
