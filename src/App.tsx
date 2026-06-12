import React from 'react';
import { useSensorController } from './presentation/useSensorController';
import { CompassCard } from './presentation/components/CompassCard';
import { MetricCard } from './presentation/components/MetricCard';
import { PulseButton } from './presentation/components/PulseButton';
import { Mountain, Gauge, MapPin, Navigation } from 'lucide-react';

const App: React.FC = () => {
  const {
    isTracking,
    error,
    heading,
    altitude,
    altitudeAccuracy,
    pressure,
    pressureSource,
    speed,
    coordinates,
    positionAccuracy,
    onToggle
  } = useSensorController();

  // 極光背景視差效果：隨指南針微幅移動與旋轉
  const bgStyle = {
    transform: `rotate(${heading * 0.1}deg) translate(${heading * 0.05}px, ${heading * -0.05}px)`
  };

  return (
    <>
      <div className="aurora-bg" style={bgStyle}></div>
      <div className="app-container">
        <header className="header">
          <h1>海拔</h1>
        </header>

        {error && (
          <div className="error-toast">
            {error}
          </div>
        )}

        <main className="main-content">
          <CompassCard heading={heading} isActive={isTracking} />
          
          <div className="metrics-grid">
            <MetricCard 
              icon={<Mountain size={16} />} 
              label="海拔高度" 
              value={altitude} 
              unit="m" 
              subValue={altitudeAccuracy} 
            />
            <MetricCard 
              icon={<Gauge size={16} />} 
              label="大氣壓力" 
              value={pressure} 
              unit="hPa" 
              subValue={pressureSource} 
            />
            <MetricCard 
              icon={<Navigation size={16} />} 
              label="移動速度" 
              value={speed} 
              unit="km/h" 
              subValue="GPS 測速" 
            />
            <MetricCard 
              icon={<MapPin size={16} />} 
              label="經緯度座標" 
              value={coordinates} 
              subValue={positionAccuracy} 
            />
          </div>
        </main>

        <PulseButton isTracking={isTracking} onClick={onToggle} />
      </div>
    </>
  );
};

export default App;
