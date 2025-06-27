import React from 'react';
import { Fellow } from '../../types';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { MessageSquare } from 'lucide-react';

interface FellowCardProps {
  fellow: Fellow;
  onConnect: (fellowId: string) => void;
}

const FellowCard: React.FC<FellowCardProps> = ({ fellow, onConnect }) => {
  return (
    <Card variant="hover\" className="flex flex-col">
      <div className="flex items-start mb-4">
        <Avatar 
          src={fellow.avatarUrl} 
          alt={fellow.name}
          size="lg"
          status={fellow.online ? 'online' : 'offline'}
        />
        
        <div className="ml-4">
          <h3 className="font-bold text-gray-800">{fellow.name}</h3>
          <p className="text-sm text-gray-500">Level {fellow.level}</p>
          <Badge color="secondary" className="mt-1">{fellow.specialty}</Badge>
        </div>
      </div>
      
      {fellow.achievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {fellow.achievements.map((achievement, index) => (
              <Badge key={index} color="accent" variant="subtle" size="sm">
                {achievement}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto">
        <Button 
          variant={fellow.online ? 'primary' : 'outline'} 
          fullWidth
          icon={<MessageSquare size={16} />}
          onClick={() => onConnect(fellow.id)}
          disabled={!fellow.online}
        >
          {fellow.online ? 'Connect' : 'Offline'}
        </Button>
      </div>
    </Card>
  );
};

export default FellowCard;