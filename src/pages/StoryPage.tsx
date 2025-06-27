import React from 'react';
import { StoryChapter } from '../types';
import StoryChapterCard from '../components/storySystem/StoryChapterCard';
import { BookOpen } from 'lucide-react';

interface StoryPageProps {
  storyChapters: StoryChapter[];
}

const StoryPage: React.FC<StoryPageProps> = ({ storyChapters }) => {
  // Sort chapters by date, oldest first
  const sortedChapters = [...storyChapters].sort(
    (a, b) => new Date(a.unlockedAt).getTime() - new Date(b.unlockedAt).getTime()
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center mb-4">
          <BookOpen className="text-purple-600 mr-3\" size={24} />
          <h2 className="text-2xl font-bold text-purple-900">Your Mythic Journey</h2>
        </div>
        <p className="text-gray-600">
          As you complete quests and challenges in the physical world, your story in Eldoria unfolds. 
          Each chapter reflects your growth and achievements in your mythic journey.
        </p>
      </div>
      
      <div className="space-y-6">
        {sortedChapters.map((chapter, index) => (
          <div key={chapter.id} className="relative">
            {index < sortedChapters.length - 1 && (
              <div className="absolute left-6 top-[calc(100%_-_8px)] h-[calc(100%_+_24px)] w-px bg-purple-200 z-0"></div>
            )}
            <div className="relative z-10">
              <StoryChapterCard chapter={chapter} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryPage;