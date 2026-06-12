import { useEffect, useState, useMemo } from 'react';
import { GetSensorDataUseCase } from '../usecase/GetSensorDataUseCase';
import type { AppSensorState } from '../usecase/GetSensorDataUseCase';
import { SensorService } from '../infrastructure/SensorService';
import { ExternalDataService } from '../infrastructure/ExternalDataService';

// Singleton，確保在元件重新渲染時不會重建底層服務
const sensorService = new SensorService();
const externalService = new ExternalDataService();
let useCaseInstance: GetSensorDataUseCase | null = null;

export const useSensorController = () => {
  const [state, setState] = useState<AppSensorState>({
    isTracking: false,
    position: null,
    heading: null,
    pressure: null,
    error: null,
    speed: null,
    locationName: null,
    weather: null,
  });

  useEffect(() => {
    // 綁定控制器與狀態
    if (!useCaseInstance) {
      useCaseInstance = new GetSensorDataUseCase(sensorService, externalService, (newState) => {
        setState(newState);
      });
    }
    
    // 組件卸載時自動停止監聽，節省電力
    return () => {
      if (useCaseInstance) {
        useCaseInstance.stopTracking();
        useCaseInstance = null;
      }
    };
  }, []);

  const handleToggleTracking = () => {
    if (!useCaseInstance) return;
    if (state.isTracking) {
      useCaseInstance.stopTracking();
    } else {
      useCaseInstance.startTracking();
    }
  };

  // 格式化：海拔高度
  const formattedAltitude = useMemo(() => {
    if (state.position?.altitude == null) return '--';
    return state.position.altitude.toFixed(1);
  }, [state.position?.altitude]);

  // 格式化：氣壓
  const formattedPressure = useMemo(() => {
    if (state.pressure?.pressure == null) return '--';
    return state.pressure.pressure.toFixed(1);
  }, [state.pressure?.pressure]);

  // 格式化：移動速度
  const formattedSpeed = useMemo(() => {
    if (state.speed == null) return '--';
    return Math.round(state.speed).toString();
  }, [state.speed]);

  // 格式化：GPS 經緯度座標
  const formattedCoordinates = useMemo(() => {
    if (state.position?.latitude == null || state.position?.longitude == null) return '--';
    const lat = Math.abs(state.position.latitude).toFixed(4) + (state.position.latitude >= 0 ? '°N' : '°S');
    const lng = Math.abs(state.position.longitude).toFixed(4) + (state.position.longitude >= 0 ? '°E' : '°W');
    return `${lat}, ${lng}`;
  }, [state.position?.latitude, state.position?.longitude]);
  
  // 格式化：天氣概況
  const weatherText = useMemo(() => {
    if (!state.weather) return '--';
    const code = state.weather.weatherCode;
    if (code === 0) return '晴朗';
    if (code >= 1 && code <= 3) return '多雲';
    if (code >= 45 && code <= 48) return '霧霾';
    if (code >= 51 && code <= 57) return '毛毛雨';
    if (code >= 61 && code <= 67) return '降雨';
    if (code >= 71 && code <= 77) return '下雪';
    if (code >= 80 && code <= 82) return '陣雨';
    if (code >= 95 && code <= 99) return '雷雨';
    return '未知';
  }, [state.weather]);
  
  // 指南針角度整數化
  const headingValue = state.heading !== null ? Math.round(state.heading) : 0;

  return {
    isTracking: state.isTracking,
    error: state.error,
    heading: headingValue,
    hasHeadingData: state.heading !== null,
    altitude: formattedAltitude,
    rawAltitude: state.position?.altitude ?? null,
    altitudeAccuracy: state.position?.altitudeAccuracy ? `精度 ±${Math.round(state.position.altitudeAccuracy)}m` : '',
    pressure: formattedPressure,
    pressureSource: state.pressure?.source === 'api' ? '外部氣象 API' : (state.pressure?.source === 'barometer' ? '硬體氣壓計' : ''),
    hasPressureData: state.pressure !== null,
    speed: formattedSpeed,
    coordinates: formattedCoordinates,
    positionAccuracy: state.position?.accuracy ? `精度 ±${Math.round(state.position.accuracy)}m` : '',
    locationName: state.locationName || (state.isTracking ? '定位中...' : '--'),
    weatherText: weatherText,
    temperature: state.weather ? `${Math.round(state.weather.temperature)}°C` : '--',
    onToggle: handleToggleTracking
  };
};
