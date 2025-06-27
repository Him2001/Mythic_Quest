import React from 'react';
import { Quest } from '../../types';
import QuestCard from './QuestCard';
import { ListFilter, Sparkles } from 'lucide-react';

interface QuestLogProps {
  quests: Quest[];
  onCompleteQuest: (questId: string, distanceWalked?: number) => void;
  onStartQuest: (questId: string) => void;
  onUpdateProgress?: (questId: string, progress: number) => void;
}

const QuestLog: React.FC<QuestLogProps> = ({ 
  quests, 
  onCompleteQuest, 
  onStartQuest, 
  onUpdateProgress 
}) => {
  const [filter, setFilter] = React.useState<'all' | 'active' | 'completed'>('all');
  
  const filteredQuests = React.useMemo(() => {
    switch (filter) {
      case 'active':
        return quests.filter(quest => !quest.completed);
      case 'completed':
        return quests.filter(quest => quest.completed);
      default:
        return quests;
    }
  }, [quests, filter]);
  
  return (
    <div className="bg-gray-50 rounded-xl p-5 shadow-inner">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-900 flex items-center">
          <Sparkles className="mr-2 text-purple-500" size={20} />
          Quest Log
        </h2>
        
        <div className="flex space-x-2 text-sm">
          <button 
            className={`px-3 py-1 rounded-full ${filter === 'all' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-full ${filter === 'active' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`px-3 py-1 rounded-full ${filter === 'completed' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>
      
      {filteredQuests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ListFilter className="mx-auto mb-2 text-gray-400" size={24} />
          <p>No quests found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onCompleteQuest}
              onStart={onStartQuest}
              onUpdateProgress={onUpdateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestLog;