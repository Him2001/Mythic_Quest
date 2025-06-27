import React from 'react';
import { Fellow } from '../../types';
import FellowCard from './FellowCard';
import { Users } from 'lucide-react';

interface HeroesHallProps {
  fellows: Fellow[];
  onConnectWithFellow: (fellowId: string) => void;
}

const HeroesHall: React.FC<HeroesHallProps> = ({ fellows, onConnectWithFellow }) => {
  const onlineFellows = fellows.filter(fellow => fellow.online);
  
  return (
    <div className="bg-gray-50 rounded-xl p-5 shadow-inner">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-900 flex items-center">
          <Users className="mr-2 text-purple-500\" size={20} />
          Hero's Hall
        </h2>
        <p className="text-gray-600 text-sm">
          Connect with other adventurers to learn from their journeys
        </p>
      </div>
      
      {onlineFellows.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-emerald-700 mb-3">
            Online Now
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {onlineFellows.map(fellow => (
              <FellowCard
                key={fellow.id}
                fellow={fellow}
                onConnect={onConnectWithFellow}
              />
            ))}
          </div>
        </>
      )}
      
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        All Adventurers
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fellows.map(fellow => (
          <FellowCard
            key={fellow.id}
            fellow={fellow}
            onConnect={onConnectWithFellow}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroesHall;