import React, { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  subValue?: string;
  fullWidth?: boolean;
}

export const MetricCard: React.FC<Props> = ({ icon, label, value, unit, subValue, fullWidth }) => {
  return (
    <div className={`glass-card metric-card ${fullWidth ? 'full-width' : ''}`}>
      <div className="metric-label">
        {icon}
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="metric-value-container">
          <span className="metric-value font-number">{value}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        {subValue && <span className="metric-sub">{subValue}</span>}
      </div>
    </div>
  );
};
