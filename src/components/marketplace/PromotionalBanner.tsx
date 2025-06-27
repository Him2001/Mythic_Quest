import React from 'react';
import { featuredPromotions } from '../../data/mockMarketplaceData';
import { Calendar, Tag, Sparkles } from 'lucide-react';

const PromotionalBanner: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-cinzel font-bold text-amber-800 mb-4 flex items-center magical-glow">
        <Tag className="mr-2" size={20} />
        Featured Promotions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuredPromotions.map((promo) => (
          <div
            key={promo.id}
            className="relative overflow-hidden rounded-xl shadow-lg border-2 border-amber-200 magical-glow group cursor-pointer"
          >
            <div className="h-48 w-full relative">
              <img 
                src={promo.imageUrl} 
                alt={promo.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Discount Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-cinzel font-bold text-sm animate-pulse">
                {promo.discount}
              </div>
              
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-xl font-cinzel font-bold mb-2 magical-glow">
                  {promo.title}
                </h3>
                <p className="text-sm font-merriweather mb-3 opacity-90">
                  {promo.description}
                </p>
                
                <div className="flex items-center text-xs text-amber-200">
                  <Calendar size={12} className="mr-1" />
                  <span>Valid until {new Date(promo.validUntil).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Magical sparkle effect */}
            <div className="absolute inset-0 pointer-events-none">
              <Sparkles className="absolute top-2 left-2 text-yellow-300 animate-ping" size={16} />
              <Sparkles className="absolute bottom-2 right-2 text-yellow-300 animate-ping" size={12} style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalBanner;