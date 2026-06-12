import React from 'react';
import { Compass } from 'lucide-react';

interface Props {
  heading: number;
  isActive: boolean;
}

export const CompassCard: React.FC<Props> = ({ heading, isActive }) => {
  return (
    <div className="glass-card metric-card" style={{ gridColumn: '1 / -1', alignItems: 'center', height: '100%', minHeight: '300px' }}>
      <div className="metric-label" style={{ alignSelf: 'flex-start', width: '100%' }}>
        <Compass size={16} /> 指南針
      </div>
      
      <div className="compass-container">
        <div className="compass-ring"></div>
        <div className="compass-ticks-wrapper" style={{ transform: `rotate(${-heading}deg)` }}>
          {/* N E S W 刻度 */}
          <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', color: '#ff2a2a', fontWeight: 600, fontSize: '18px' }}>N</div>
          <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '18px' }}>S</div>
          <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '18px' }}>E</div>
          <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '18px' }}>W</div>
          
          {/* 指北針紅色標記 */}
          <div style={{
            position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
            width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '24px solid rgba(255, 42, 42, 0.5)'
          }}></div>
        </div>
        
        <div className="compass-center"></div>
        <div className="compass-degree-display font-number">
          {isActive ? `${heading}°` : '--°'}
        </div>
      </div>
    </div>
  );
};
