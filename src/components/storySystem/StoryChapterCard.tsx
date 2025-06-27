import React, { useState } from 'react';
import { StoryChapter } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BookOpen, ChevronDown, ChevronUp, Scroll, Calendar } from 'lucide-react';

interface StoryChapterCardProps {
  chapter: StoryChapter;
}

const StoryChapterCard: React.FC<StoryChapterCardProps> = ({ chapter }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <Card className="overflow-hidden fantasy-card">
      {chapter.imageUrl && (
        <div className="h-48 w-full mb-4 -mx-5 -mt-5 relative">
          <img 
            src={chapter.imageUrl} 
            alt={chapter.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark/90 via-mystic-dark/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <div className="flex items-center mb-2">
              <Scroll className="text-amber-400 mr-2" size={20} />
              <h3 className="text-amber-100 text-xl font-cinzel font-bold magical-glow">{chapter.title}</h3>
            </div>
            <p className="text-amber-200/80 text-sm font-cinzel flex items-center">
              <Calendar size={14} className="mr-1.5" />
              Discovered on {formatDate(chapter.unlockedAt)}
            </p>
          </div>
        </div>
      )}
      
      {!chapter.imageUrl && (
        <div className="mb-3">
          <div className="flex items-center mb-2">
            <Scroll className="text-amber-700 mr-2" size={20} />
            <h3 className="text-xl font-cinzel font-bold text-mystic-dark magical-glow">{chapter.title}</h3>
          </div>
          <p className="text-sm text-amber-800 font-cinzel flex items-center">
            <Calendar size={14} className="mr-1.5" />
            Discovered on {formatDate(chapter.unlockedAt)}
          </p>
        </div>
      )}
      
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-20'}`}>
        <p className="text-gray-700 font-merriweather leading-relaxed">{chapter.content}</p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-amber-200 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleExpanded}
          icon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          className="font-cinzel"
        >
          {expanded ? 'Show Less' : 'Continue Reading'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          icon={<BookOpen size={16} />}
          className="font-cinzel magical-glow"
        >
          Chronicle
        </Button>
      </div>
    </Card>
  );
};

export default StoryChapterCard;