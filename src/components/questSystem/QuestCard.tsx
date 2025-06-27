import React from 'react';
import { Quest } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { CheckCircle, Clock, Award, Scroll, Coins, Plus } from 'lucide-react';
import WalkingQuestCard from './WalkingQuestCard';
import { CoinSystem } from '../../utils/coinSystem';
import { SoundEffects } from '../../utils/soundEffects';

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string, distanceWalked?: number) => void;
  onStart: (questId: string) => void;
  onUpdateProgress?: (questId: string, progress: number) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete, onStart, onUpdateProgress }) => {
  // Use specialized walking quest card for walking quests
  if (quest.type === 'walking') {
    return (
      <WalkingQuestCard
        quest={quest}
        onComplete={onComplete}
        onStart={onStart}
        onUpdateProgress={onUpdateProgress || (() => {})}
      />
    );
  }

  const getQuestTypeColor = (type: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' => {
    const typeMap: Record<string, any> = {
      walking: 'primary',
      exercise: 'secondary',
      journaling: 'accent',
      meditation: 'success',
      reading: 'warning',
      social: 'primary'
    };
    return typeMap[type] || 'primary';
  };
  
  const getDifficultyBadge = (difficulty: string) => {
    const difficultyMap: Record<string, any> = {
      easy: { color: 'success', label: 'Apprentice' },
      medium: { color: 'warning', label: 'Adept' },
      hard: { color: 'error', label: 'Master' }
    };
    
    const { color, label } = difficultyMap[difficulty] || difficultyMap.easy;
    
    return <Badge color={color} variant="subtle">{label}</Badge>;
  };

  // Calculate coin reward
  const coinReward = quest.coinReward || CoinSystem.calculateQuestReward(quest.type, quest.difficulty);

  const handleQuestComplete = () => {
    // Play quest completion sound
    SoundEffects.playSound('quest-complete');
    
    // Play coin sound after a short delay
    setTimeout(() => {
      SoundEffects.playSound('coin');
    }, 500);
    
    // Call the original completion handler
    onComplete(quest.id);
  };

  const handleQuestStart = () => {
    // Play magic sound for quest start
    SoundEffects.playSound('magic');
    onStart(quest.id);
  };
  
  return (
    <Card 
      variant="hover" 
      className={`relative border-l-4 ${
        quest.completed ? 'border-l-green-500' : 'border-l-amber-500'
      } fantasy-card`}
    >
      {quest.completed && (
        <div className="absolute top-6 right-6 magical-glow">
          <CheckCircle className="text-green-500" size={24} />
        </div>
      )}
      
      <div className="flex flex-col h-full p-5">
        <div className="mb-3 flex items-start justify-between">
          <Badge 
            color={getQuestTypeColor(quest.type)} 
            variant="default"
            className="mb-2 magical-glow"
          >
            <Scroll size={14} className="mr-1" />
            {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}
          </Badge>
          {getDifficultyBadge(quest.difficulty)}
        </div>
        
        <h3 className="text-lg font-cinzel font-bold text-mystic-dark mb-3">{quest.title}</h3>
        <p className="text-sm text-gray-700 mb-4 font-merriweather">{quest.description}</p>
        
        {quest.progress !== undefined && quest.totalRequired !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2 font-cinzel">
              <span>Progress</span>
              <span>{quest.progress}/{quest.totalRequired}</span>
            </div>
            <ProgressBar 
              progress={Math.round((quest.progress / quest.totalRequired) * 100)} 
              color={getQuestTypeColor(quest.type)}
              height="md"
              animated
            />
          </div>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-amber-700">
              <Award size={16} className="mr-1 magical-glow" />
              <span className="text-sm font-cinzel">{quest.xpReward} XP</span>
            </div>
            
            <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              <Coins size={14} className="mr-1 magical-glow" />
              <Plus size={10} className="mr-1" />
              <span className="text-sm font-cinzel font-bold">{coinReward}</span>
            </div>
          </div>
          
          {quest.deadline && (
            <div className="flex items-center text-gray-600 text-xs">
              <Clock size={14} className="mr-1" />
              <span className="font-merriweather">
                {new Date(quest.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          {quest.completed ? (
            <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-600 mr-2" size={16} />
              <span className="font-cinzel text-green-800 font-bold">Quest Completed!</span>
              <div className="ml-2 flex items-center text-green-600">
                <Coins size={14} className="mr-1" />
                <span className="text-sm font-cinzel">+{coinReward} earned</span>
              </div>
            </div>
          ) : (
            <Button 
              variant="primary" 
              fullWidth
              onClick={handleQuestComplete}
              className="font-cinzel magical-glow"
              soundEffect="quest-complete"
            >
              <div className="flex items-center justify-center">
                <span>Complete Quest</span>
                <div className="ml-2 flex items-center text-amber-200">
                  <Plus size={12} className="mr-1" />
                  <Coins size={14} className="mr-1" />
                  <span className="text-sm">{coinReward}</span>
                </div>
              </div>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuestCard;