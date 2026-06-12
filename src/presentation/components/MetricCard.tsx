import React from 'react';
import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  subValue?: string;
  fullWidth?: boolean;
  valueColor?: string;
}

export const MetricCard: React.FC<Props> = ({ icon, label, value, unit, subValue, fullWidth, valueColor }) => {
  return (
    <div className={`glass-card metric-card ${fullWidth ? 'full-width' : ''}`}>
      <div className="metric-label">
        {icon}
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="metric-value-container">
          <span className="metric-value font-number" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        {subValue && <span className="metric-sub">{subValue}</span>}
      </div>
    </div>
  );
};
