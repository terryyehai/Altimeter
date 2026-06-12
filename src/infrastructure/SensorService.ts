import { ISensorService, PositionData } from '../domain/ISensorService';

export class SensorService implements ISensorService {
  watchPosition(onSuccess: (data: PositionData) => void, onError: (err: Error) => void): () => void {
    if (!navigator.geolocation) {
      onError(new Error('您的瀏覽器不支援地理定位'));
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
        });
      },
      (error) => {
        onError(new Error(error.message));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }

  watchOrientation(onUpdate: (heading: number | null) => void): () => void {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading (直接提供精確指南針角度)
      if ('webkitCompassHeading' in event) {
        onUpdate((event as any).webkitCompassHeading);
      } 
      // 標準 DeviceOrientation API
      else if (event.absolute && event.alpha !== null) {
        // 從 alpha 計算指南針朝向 (360 - alpha)
        onUpdate(360 - event.alpha);
      } else {
        onUpdate(null);
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    // 為了相容 iOS Safari 的 Fallback
    window.addEventListener('deviceorientation', handleOrientation as EventListener, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
    };
  }

  async requestOrientationPermission(): Promise<boolean> {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        return permissionState === 'granted';
      } catch (error) {
        console.error('設備方向權限請求失敗', error);
        return false;
      }
    }
    // 非 iOS 13+ 的設備不需請求
    return true; 
  }

  watchPressure(onUpdate: (pressure: number) => void, onError: (err: Error) => void): () => void {
    if ('Barometer' in window) {
      try {
        // @ts-ignore: Barometer 是實驗性 API
        const barometer = new window.Barometer({ frequency: 1 });
        barometer.addEventListener('reading', () => {
          // W3C 規範 Barometer 返回 hPa (百帕)
          onUpdate(barometer.pressure);
        });
        barometer.addEventListener('error', (e: any) => {
          onError(new Error(e.error?.message || '氣壓計發生錯誤'));
        });
        barometer.start();
        
        return () => {
          barometer.stop();
        };
      } catch (e: any) {
        onError(e);
        return () => {};
      }
    } else {
      onError(new Error('不支援 Barometer API'));
      return () => {};
    }
  }

  async fetchPressureFromApi(latitude: number, longitude: number): Promise<number> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=surface_pressure`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('無法從氣象 API 獲取氣壓');
    }
    const data = await response.json();
    if (data.current && data.current.surface_pressure) {
      return data.current.surface_pressure; // 單位為 hPa
    }
    throw new Error('氣象 API 回傳格式無效');
  }
}
