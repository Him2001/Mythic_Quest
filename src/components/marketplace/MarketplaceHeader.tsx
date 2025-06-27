import React from 'react';
import { ShoppingBag, Sparkles, TrendingUp, Gift } from 'lucide-react';
import CoinDisplay from '../ui/CoinDisplay';

interface MarketplaceHeaderProps {
  userCoins: number;
  cartItemCount: number;
  onViewCart: () => void;
}

const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  userCoins,
  cartItemCount,
  onViewCart
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ShoppingBag className="text-amber-600 mr-3 magical-glow\" size={28} />
          <div>
            <h1 className="text-2xl font-cinzel font-bold text-amber-800 magical-glow">
              Mystic Marketplace
            </h1>
            <p className="text-amber-700 font-merriweather flex items-center">
              <Sparkles size={16} className="mr-2" />
              Premium wellness gear for your legendary journey
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <CoinDisplay coins={userCoins} size="md" />
          
          <button
            onClick={onViewCart}
            className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg font-cinzel font-bold shadow-lg hover:shadow-xl transition-all duration-300 magical-glow"
          >
            <div className="flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              Cart
            </div>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 magical-glow">
          <div className="flex items-center mb-2">
            <TrendingUp className="text-green-600 mr-2" size={20} />
            <h3 className="font-cinzel font-bold text-green-800">Premium Quality</h3>
          </div>
          <p className="text-sm text-green-700 font-merriweather">
            Curated wellness products from trusted brands
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 magical-glow">
          <div className="flex items-center mb-2">
            <Sparkles className="text-blue-600 mr-2" size={20} />
            <h3 className="font-cinzel font-bold text-blue-800">Dual Payment</h3>
          </div>
          <p className="text-sm text-blue-700 font-merriweather">
            Pay with Mythic Coins or traditional payment methods
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200 magical-glow">
          <div className="flex items-center mb-2">
            <Gift className="text-purple-600 mr-2" size={20} />
            <h3 className="font-cinzel font-bold text-purple-800">Exclusive Rewards</h3>
          </div>
          <p className="text-sm text-purple-700 font-merriweather">
            Earn coins through quests to unlock premium gear
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader