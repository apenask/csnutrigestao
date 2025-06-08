import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'green' | 'red' | 'yellow' | 'purple' | 'neutral';
}

export function KPICard({ title, value, icon: Icon, color }: KPICardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-500',
          iconBg: 'bg-green-100',
        };
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-500',
          iconBg: 'bg-red-100',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-500',
          iconBg: 'bg-yellow-100',
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          text: 'text-purple-500',
          iconBg: 'bg-purple-100',
        };
      case 'neutral':
      default:
        return {
          bg: 'transparent',
          text: 'text-gray-400',
          iconBg: 'transparent',
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className="card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses.iconBg}`}>
          <Icon 
            size={24} 
            className={color === 'neutral' ? 'text-white' : colorClasses.text}
          />
        </div>
      </div>
    </div>
  );
}