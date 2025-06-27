import React from 'react';
import QuestLog from '../components/questSystem/QuestLog';
import { Quest } from '../types';

interface QuestsPageProps {
  quests: Quest[];
  onCompleteQuest: (questId: string, distanceWalked?: number) => void;
  onStartQuest: (questId: string) => void;
  onUpdateProgress?: (questId: string, progress: number) => void;
}

const QuestsPage: React.FC<QuestsPageProps> = ({ 
  quests, 
  onCompleteQuest, 
  onStartQuest, 
  onUpdateProgress 
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <QuestLog 
        quests={quests} 
        onCompleteQuest={onCompleteQuest} 
        onStartQuest={onStartQuest}
        onUpdateProgress={onUpdateProgress}
      />
    </div>
  );
};

export default QuestsPage;