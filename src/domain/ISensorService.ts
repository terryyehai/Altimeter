export type PositionData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
};

export type PressureData = {
  pressure: number | null;
  source: 'barometer' | 'api' | 'none';
};

export interface ISensorService {
  /** 監聽地理位置，回傳取消監聽的函式 */
  watchPosition(onSuccess: (data: PositionData) => void, onError: (err: Error) => void): () => void;
  
  /** 監聽設備方向（指南針），回傳取消監聽的函式 */
  watchOrientation(onUpdate: (heading: number | null) => void): () => void;
  
  /** 請求設備方向權限 (iOS 專用) */
  requestOrientationPermission(): Promise<boolean>;
  
  /** 監聽硬體氣壓計，回傳取消監聽的函式 */
  watchPressure(onUpdate: (pressure: number) => void, onError: (err: Error) => void): () => void;
  
  /** 透過外部 API 獲取氣壓 */
  fetchPressureFromApi(latitude: number, longitude: number): Promise<number>;
}
