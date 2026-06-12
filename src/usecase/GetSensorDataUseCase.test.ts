import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSensorDataUseCase } from './GetSensorDataUseCase';
import type { AppSensorState } from './GetSensorDataUseCase';
import type { ISensorService } from '../domain/ISensorService';
import type { IExternalDataService } from '../domain/IExternalDataService';

describe('GetSensorDataUseCase (核心邏輯與退路機制測試)', () => {
  let mockService: ISensorService;
  let mockExternalService: IExternalDataService;
  let useCase: GetSensorDataUseCase;
  let stateChanges: AppSensorState[];

  beforeEach(() => {
    stateChanges = [];
    mockService = {
      watchPosition: vi.fn().mockImplementation((onSuccess) => {
        onSuccess({ latitude: 25.033, longitude: 121.565, accuracy: 10, altitude: 100, altitudeAccuracy: 5 });
        return () => {};
      }),
      watchOrientation: vi.fn().mockImplementation((onUpdate) => {
        onUpdate(90);
        return () => {};
      }),
      requestOrientationPermission: vi.fn().mockResolvedValue(true),
      watchPressure: vi.fn().mockImplementation((onUpdate) => {
        onUpdate(1013.25);
        return () => {};
      }),
      getPressureFromApi: vi.fn().mockResolvedValue(1012.0),
    } as unknown as ISensorService;

    mockExternalService = {
      getLocationName: vi.fn().mockResolvedValue('台中西屯'),
      getWeather: vi.fn().mockResolvedValue({ temperature: 25, weatherCode: 1 })
    };

    useCase = new GetSensorDataUseCase(mockService, mockExternalService, (state: AppSensorState) => {
      stateChanges.push(state);
    });
  });

  it('應該能成功開始追蹤，並從硬體感測器獲得數據 (包含氣壓計)', async () => {
    await useCase.startTracking();

    expect(stateChanges.length).toBeGreaterThan(0);
    const finalState = stateChanges[stateChanges.length - 1];
    
    expect(finalState.isTracking).toBe(true);
    expect(finalState.position?.latitude).toBe(25.033);
    expect(finalState.heading).toBe(90);
    expect(finalState.pressure?.pressure).toBe(1013.25);
    expect(finalState.pressure?.source).toBe('barometer'); // 確認來源是硬體
  });

  it('當硬體氣壓計失效或不支援時，應該自動觸發 Open-Meteo API 退路', async () => {
    // 覆寫氣壓計監聽，模擬不支援的情況
    mockService.watchPressure = vi.fn().mockImplementation((_, onError) => {
      onError(new Error('Browser does not support Barometer API'));
      return () => {};
    });

    await useCase.startTracking();

    // 等待 Promise (因 fetch API 為異步呼叫)
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const finalState = stateChanges[stateChanges.length - 1];
    
    // 確認來源已經自動切換成 API，且數據更新正確
    expect(finalState.pressure?.pressure).toBe(1012.0);
    expect(finalState.pressure?.source).toBe('api');
  });

  it('應該能成功停止追蹤並清理所有訂閱', () => {
    useCase.startTracking();
    useCase.stopTracking();
    
    const finalState = stateChanges[stateChanges.length - 1];
    expect(finalState.isTracking).toBe(false);
  });
});
