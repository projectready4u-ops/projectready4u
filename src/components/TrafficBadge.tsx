'use client';

import { Badge } from '@/components/ui/badge';

interface TrafficBadgeProps {
  source: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TrafficBadge({ source, size = 'md' }: TrafficBadgeProps) {
  const sourceConfig: Record<string, { icon: string; color: string }> = {
    youtube: { icon: '📺', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
    google: { icon: '🔍', color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    whatsapp: { icon: '💬', color: 'bg-green-500/20 text-green-400 border-green-500/20' },
    friend: { icon: '👥', color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
    other: { icon: '❓', color: 'bg-gray-500/20 text-gray-400 border-gray-500/20' },
  };

  const config = sourceConfig[source.toLowerCase()] || sourceConfig['other'];

  const sizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <Badge className={`border ${config.color} ${sizeClass}`}>
      {config.icon} {source}
    </Badge>
  );
}
