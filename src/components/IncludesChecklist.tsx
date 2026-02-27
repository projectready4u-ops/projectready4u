'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface IncludesChecklistProps {
  includes: {
    source?: boolean;
    report?: boolean;
    ppt?: boolean;
    synopsis?: boolean;
    viva?: boolean;
    readme?: boolean;
  };
}

export function IncludesChecklist({ includes }: IncludesChecklistProps) {
  const items = [
    { label: 'Source Code (ZIP)', key: 'source', icon: '💻' },
    { label: 'Project Report (PDF)', key: 'report', icon: '📄' },
    { label: 'PPT Presentation', key: 'ppt', icon: '🎨' },
    { label: 'Synopsis Document', key: 'synopsis', icon: '📋' },
    { label: 'Viva Questions & Answers', key: 'viva', icon: '❓' },
    { label: 'README / How to Run Guide', key: 'readme', icon: '📖' },
  ];

  return (
    <Card className="border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">What's Included</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const isIncluded = includes[item.key as keyof typeof includes];
          return (
            <div key={item.key} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isIncluded ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-500/5 border-gray-500/20 opacity-50'}`}>
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isIncluded ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {item.label}
                </p>
              </div>
              {isIncluded && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
