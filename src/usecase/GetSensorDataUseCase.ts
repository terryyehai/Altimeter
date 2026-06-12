import type { ISensorService, PositionData, PressureData } from '../domain/ISensorService';
import type { IExternalDataService, WeatherData } from '../domain/IExternalDataService';

export type AppSensorState = {
  isTracking: boolean;
  position: PositionData | null;
  heading: number | null;
  pressure: PressureData | null;
  error: string | null;
  speed: number | null; // km/h
  locationName: string | null;
  weather: WeatherData | null;
};

export class GetSensorDataUseCase {
  private service: ISensorService;
  private watchPositionCleanup: (() => void) | null = null;
  private watchOrientationCleanup: (() => void) | null = null;
  private watchPressureCleanup: (() => void) | null = null;
  
  // 記錄是否已經呼叫過 API 避免頻繁發送請求
  private lastApiFetchTime: number = 0; 

  private state: AppSensorState = {
    isTracking: false,
    position: null,
    heading: null,
    pressure: null,
    error: null,
    speed: null,
    locationName: null,
    weather: null,
  };

  private onStateChange: (state: AppSensorState) => void;
  private externalDataService: IExternalDataService;
  private lastApiCallTime = 0;

  constructor(service: ISensorService, externalService: IExternalDataService, onStateChange: (state: AppSensorState) => void) {
    this.service = service;
    this.externalDataService = externalService;
    this.onStateChange = onStateChange;
  }

  public async startTracking() {
    this.state.isTracking = true;
    this.state.error = null;
    this.notify();

    // 1. 請求指南針權限 (必須在使用者點擊按鈕的同步事件內觸發)
    const hasOrientationPermission = await this.service.requestOrientationPermission();

    // 2. 開始監聽 GPS 與海拔
    this.watchPositionCleanup = this.service.watchPosition(
      (position) => {
        this.state.position = position;
        
        if (position.speed !== null && position.speed >= 0) {
          this.state.speed = position.speed * 3.6; // convert m/s to km/h
        }
        
        this.notify();
        
        // 若沒有硬體氣壓計數據，則透過 GPS 座標呼叫 API
        if (!this.state.pressure && position.altitude === null && position.latitude && position.longitude) {
          this.service.fetchPressureFromApi(position.latitude, position.longitude).then((pressure: PressureData) => {
            this.state.pressure = pressure;
            this.notify();
          }).catch(() => {
            // 忽略錯誤
          });
        }
        
        // 請求地理位置與氣象 (加入 1 分鐘防抖機制避免被封鎖)
        if (position.latitude && position.longitude) {
          const now = Date.now();
          if (now - this.lastApiCallTime > 60000 || !this.state.locationName) {
            this.lastApiCallTime = now;
            
            this.externalDataService.getLocationName(position.latitude, position.longitude).then(name => {
              if (name) {
                this.state.locationName = name;
                this.notify();
              }
            });
            
            this.externalDataService.getWeather(position.latitude, position.longitude).then(weather => {
              if (weather) {
                this.state.weather = weather;
                this.notify();
              }
            });
          }
        }
      },
      (error) => {
        this.state.error = `定位錯誤: ${error.message}`;
        this.notify();
      }
    );

    // 3. 開始監聽指南針
    if (hasOrientationPermission) {
      this.watchOrientationCleanup = this.service.watchOrientation((heading) => {
        this.state.heading = heading;
        this.notify();
      });
    }

    // 4. 開始監聽硬體氣壓計
    this.watchPressureCleanup = this.service.watchPressure(
      (p) => {
        this.state.pressure = { pressure: p, source: 'barometer' };
        this.notify();
      },
      (error) => {
        console.warn('硬體氣壓計不可用，將在獲取 GPS 後自動切換為氣象 API 退路', error.message);
      }
    );
  }

  public stopTracking() {
    this.state.isTracking = false;
    if (this.watchPositionCleanup) this.watchPositionCleanup();
    if (this.watchOrientationCleanup) this.watchOrientationCleanup();
    if (this.watchPressureCleanup) this.watchPressureCleanup();
    
    this.watchPositionCleanup = null;
    this.watchOrientationCleanup = null;
    this.watchPressureCleanup = null;
    this.notify();
  }

  private notify() {
    this.onStateChange({ ...this.state });
  }

  private async updatePressureFromApi(lat: number, lng: number) {
    const now = Date.now();
    // 限制至少每 60 秒才發送一次 API 請求，避免超過免費 API 額度
    if (now - this.lastApiFetchTime < 60000) return; 
    this.lastApiFetchTime = now;

    try {
      const p = await this.service.fetchPressureFromApi(lat, lng);
      // 確保硬體氣壓計沒有成功讀取時，才覆蓋為 API 數據
      if (this.state.pressure?.source !== 'barometer') {
        this.state.pressure = { pressure: p, source: 'api' };
        this.notify();
      }
    } catch (err) {
      console.error('API 氣壓退路失敗', err);
    }
  }
}
