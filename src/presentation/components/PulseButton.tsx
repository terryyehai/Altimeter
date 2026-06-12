import React from 'react';
import { LocateFixed, Power } from 'lucide-react';

interface Props {
  isTracking: boolean;
  onClick: () => void;
}

export const PulseButton: React.FC<Props> = ({ isTracking, onClick }) => {
  return (
    <div className="action-area">
      <div className="pulse-btn-wrapper">
        <div className={`pulse-ring ${isTracking ? 'active' : ''}`}></div>
        <button 
          className={`pulse-btn ${isTracking ? 'tracking' : ''}`} 
          onClick={onClick}
          aria-label={isTracking ? '停止讀取' : '開始讀取'}
        >
          {isTracking ? <LocateFixed size={24} className="btn-icon" /> : <Power size={24} />}
          <span>{isTracking ? '讀取中' : '海拔'}</span>
        </button>
      </div>
    </div>
  );
};
