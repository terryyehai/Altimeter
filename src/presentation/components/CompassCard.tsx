import React from 'react';
import { Compass } from 'lucide-react';

interface Props {
  heading: number;
  isActive: boolean;
}

const MOUNTAINS = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙', '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];
const TRIGRAMS = ['坎', '艮', '震', '巽', '離', '坤', '兌', '乾'];

const getMountain = (deg: number) => {
  const normalized = (deg + 360) % 360;
  const index = Math.round(normalized / 15) % 24;
  return MOUNTAINS[index];
};

const getTrigram = (deg: number) => {
  const normalized = (deg + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return TRIGRAMS[index];
};

export const CompassCard: React.FC<Props> = ({ heading, isActive }) => {
  return (
    <div className="glass-card metric-card" style={{ gridColumn: '1 / -1', alignItems: 'center', minHeight: '380px' }}>
      <div className="metric-label" style={{ alignSelf: 'flex-start', width: '100%' }}>
        <Compass size={16} /> 風水電子羅盤
      </div>
      
      <div className="compass-container" style={{ width: '100%', maxWidth: '280px', margin: '16px auto', aspectRatio: '1/1', position: 'relative' }}>
        
        {/* 外框裝飾 */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(218, 165, 32, 0.3)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 15px rgba(218, 165, 32, 0.1)' }}></div>
        
        {/* 會旋轉的羅盤盤面 */}
        <div className="compass-ticks-wrapper" style={{ transform: `rotate(${-heading}deg)`, width: '100%', height: '100%', position: 'absolute', borderRadius: '50%', overflow: 'hidden' }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            {/* 中間天池 */}
            <circle cx="150" cy="150" r="30" fill="#0a0a0c" stroke="rgba(218, 165, 32, 0.5)" strokeWidth="2" />
            
            {/* 八卦內圈 (半徑 30~80) */}
            <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(218, 165, 32, 0.3)" strokeWidth="1" />
            {TRIGRAMS.map((t, i) => {
              const angle = i * 45;
              return (
                <g key={`t-${i}`} transform={`rotate(${angle}, 150, 150)`}>
                  <text x="150" y="65" textAnchor="middle" fill="#e2c044" fontSize="18" fontWeight="600" fontFamily="'Noto Sans TC', sans-serif">{t}</text>
                  <line x1="150" y1="30" x2="150" y2="80" stroke="rgba(218, 165, 32, 0.2)" strokeWidth="1" />
                </g>
              );
            })}

            {/* 二十四山中圈 (半徑 80~120) */}
            <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(218, 165, 32, 0.3)" strokeWidth="1" />
            {MOUNTAINS.map((m, i) => {
              const angle = i * 15;
              const isCardinal = i % 6 === 0; // 四正位 (子午卯酉等)
              return (
                <g key={`m-${i}`} transform={`rotate(${angle}, 150, 150)`}>
                  <text x="150" y="105" textAnchor="middle" fill={isCardinal ? "#ff4444" : "rgba(255,255,255,0.8)"} fontSize="14" fontWeight="500" fontFamily="'Noto Sans TC', sans-serif">{m}</text>
                  <line x1="150" y1="80" x2="150" y2="120" stroke="rgba(218, 165, 32, 0.2)" strokeWidth="1" />
                </g>
              );
            })}
            
            {/* 刻度外圈 (半徑 120~145) */}
            <circle cx="150" cy="150" r="145" fill="none" stroke="rgba(218, 165, 32, 0.5)" strokeWidth="2" />
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = i * 5;
              const isMajor = i % 3 === 0; // 每 15 度為大刻度
              return (
                <g key={`tick-${i}`} transform={`rotate(${angle}, 150, 150)`}>
                  <line x1="150" y1="120" x2="150" y2={isMajor ? 130 : 125} stroke={isMajor ? "#e2c044" : "rgba(255,255,255,0.3)"} strokeWidth={isMajor ? 2 : 1} />
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* 天心十道 (風水羅盤專屬十字紅線) */}
        <div style={{ position: 'absolute', top: '5%', left: '50%', width: '1px', height: '90%', background: 'rgba(255, 60, 60, 0.6)', zIndex: 10, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '5%', width: '90%', height: '1px', background: 'rgba(255, 60, 60, 0.6)', zIndex: 10, pointerEvents: 'none' }}></div>
        
        {/* 正前方指示標記 */}
        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '16px solid #ff4444', zIndex: 11 }}></div>
      </div>

      {/* 數據顯示區塊 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px', gap: '6px' }}>
        <div className="font-number" style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          {isActive ? `${heading}°` : '--°'}
        </div>
        {isActive ? (
          <>
            <div style={{ color: '#e2c044', fontSize: '18px', fontWeight: 600, letterSpacing: '4px' }}>
              坐{getMountain(heading + 180)} 向{getMountain(heading)}
            </div>
            <div className="metric-sub" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {getTrigram(heading)}卦向
            </div>
          </>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px', letterSpacing: '4px' }}>
            坐- 向-
          </div>
        )}
      </div>
    </div>
  );
};
