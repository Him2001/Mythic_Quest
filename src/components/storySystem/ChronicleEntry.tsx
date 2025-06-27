import React from 'react';
import { Chronicle } from '../../types';
import Card from '../ui/Card';
import { format } from 'date-fns';
import { Calendar, Bookmark, ScrollText } from 'lucide-react';

interface ChronicleEntryProps {
  chronicle: Chronicle;
  className?: string;
}

const ChronicleEntry: React.FC<ChronicleEntryProps> = ({ chronicle, className = '' }) => {
  return (
    <Card className={`overflow-hidden fantasy-card ${className}`}>
      {chronicle.imageUrl && (
        <div className="h-48 w-full relative mb-4">
          <img 
            src={chronicle.imageUrl} 
            alt={chronicle.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark/90 via-mystic-dark/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-4">
            <div className="flex items-center gap-2 text-amber-200/80 text-sm font-cinzel mb-2">
              <Calendar size={14} />
              <span>{format(chronicle.date, 'MMMM d, yyyy')}</span>
            </div>
            
            <h3 className="text-amber-100 text-xl font-cinzel font-bold magical-glow flex items-center gap-2">
              <ScrollText size={20} className="text-amber-400" />
              {chronicle.title}
            </h3>
          </div>
        </div>
      )}
      
      <div className="px-6 pb-6">
        {!chronicle.imageUrl && (
          <div className="mb-4">
            <h3 className="text-xl font-cinzel font-bold text-mystic-dark magical-glow flex items-center gap-2 mb-2">
              <ScrollText size={20} className="text-amber-700" />
              {chronicle.title}
            </h3>
            <div className="flex items-center gap-2 text-amber-700 text-sm font-cinzel">
              <Calendar size={14} />
              <span>{format(chronicle.date, 'MMMM d, yyyy')}</span>
            </div>
          </div>
        )}
        
        <div className="prose prose-amber prose-lg max-w-none">
          <div className="font-merriweather text-gray-700 leading-relaxed">
            {chronicle.content}
          </div>
        </div>
        
        {chronicle.mood && (
          <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Bookmark size={14} />
              <span className="font-cinzel capitalize">{chronicle.mood}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChronicleEntry;