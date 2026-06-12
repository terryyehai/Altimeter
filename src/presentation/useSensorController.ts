import { useEffect, useState, useMemo } from 'react';
import { GetSensorDataUseCase, AppSensorState } from '../../usecase/GetSensorDataUseCase';
import { SensorService } from '../../infrastructure/SensorService';

// Singleton，確保在元件重新渲染時不會重建底層服務
const sensorService = new SensorService();
let useCaseInstance: GetSensorDataUseCase | null = null;

export const useSensorController = () => {
  const [state, setState] = useState<AppSensorState>({
    isTracking: false,
    position: null,
    heading: null,
    pressure: null,
    error: null,
  });

  useEffect(() => {
    // 綁定控制器與狀態
    if (!useCaseInstance) {
      useCaseInstance = new GetSensorDataUseCase(sensorService, (newState) => {
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

  // 格式化：GPS 經緯度座標
  const formattedCoordinates = useMemo(() => {
    if (state.position?.latitude == null || state.position?.longitude == null) return '--';
    const lat = Math.abs(state.position.latitude).toFixed(4) + (state.position.latitude >= 0 ? '°N' : '°S');
    const lng = Math.abs(state.position.longitude).toFixed(4) + (state.position.longitude >= 0 ? '°E' : '°W');
    return `${lat}, ${lng}`;
  }, [state.position?.latitude, state.position?.longitude]);
  
  // 指南針角度整數化
  const headingValue = state.heading !== null ? Math.round(state.heading) : 0;

  return {
    isTracking: state.isTracking,
    error: state.error,
    heading: headingValue,
    hasHeadingData: state.heading !== null,
    altitude: formattedAltitude,
    altitudeAccuracy: state.position?.altitudeAccuracy ? `精度 ±${Math.round(state.position.altitudeAccuracy)}m` : '',
    pressure: formattedPressure,
    pressureSource: state.pressure?.source === 'api' ? '外部氣象 API' : (state.pressure?.source === 'barometer' ? '硬體氣壓計' : ''),
    hasPressureData: state.pressure !== null,
    coordinates: formattedCoordinates,
    positionAccuracy: state.position?.accuracy ? `精度 ±${Math.round(state.position.accuracy)}m` : '',
    onToggle: handleToggleTracking
  };
};
