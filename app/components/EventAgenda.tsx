'use client';

import { Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface AgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

interface EventAgendaProps {
  agenda: AgendaItem[];
  className?: string;
}

export function EventAgenda({ agenda, className = '' }: EventAgendaProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  if (!agenda || agenda.length === 0) {
    return null;
  }

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5 text-teal-600" />
        Event Schedule
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 to-cyan-500" />

        {/* Agenda items */}
        <div className="space-y-4">
          {agenda.map((item, index) => (
            <div key={index} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-white border-2 border-teal-500 z-10" />

              <Card
                className={`p-4 transition-all hover:shadow-md cursor-pointer ${
                  expandedItems.has(index) ? 'border-teal-300 bg-teal-50/30' : ''
                }`}
                onClick={() => item.description && toggleItem(index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-teal-100 text-teal-800 text-xs">
                        {item.time}
                      </Badge>
                      {item.speaker && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{item.speaker}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>

                    {/* Expandable description */}
                    {item.description && expandedItems.has(index) && (
                      <p className="mt-2 text-sm text-gray-600 animate-in fade-in slide-in-from-top-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.description && (
                    <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                      {expandedItems.has(index) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact version for previews
export function EventAgendaCompact({ agenda }: { agenda: AgendaItem[] }) {
  if (!agenda || agenda.length === 0) return null;

  const displayItems = agenda.slice(0, 3);
  const hasMore = agenda.length > 3;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
        <Clock className="w-4 h-4 text-teal-600" />
        Schedule
      </h4>
      <div className="space-y-1">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="text-teal-600 font-medium w-16 flex-shrink-0">{item.time}</span>
            <span className="text-gray-600 truncate">{item.title}</span>
          </div>
        ))}
        {hasMore && (
          <p className="text-xs text-gray-500">+{agenda.length - 3} more items</p>
        )}
      </div>
    </div>
  );
}
