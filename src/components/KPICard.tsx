import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'red' | 'green' | 'yellow' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, color, trend }: KPICardProps) {
  const colorClasses = {
    red: 'gradient-bg-red',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="card rounded-xl p-6 hover-lift animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                vs. mês anterior
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color === 'red' ? 'gradient-bg-red' : `bg-gradient-to-r ${colorClasses[color]}`}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}