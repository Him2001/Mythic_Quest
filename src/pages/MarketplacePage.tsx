import React, { useState, useEffect } from 'react';
import { MarketplaceItem, InventoryItem, PurchaseResult } from '../types';
import { mockMarketplaceItems } from '../data/mockMarketplaceData';
import { MarketplaceService } from '../utils/marketplaceService';
import MarketplaceHeader from '../components/marketplace/MarketplaceHeader';
import PromotionalBanner from '../components/marketplace/PromotionalBanner';
import MarketplaceFilters from '../components/marketplace/MarketplaceFilters';
import ProductGrid from '../components/marketplace/ProductGrid';
import CoinAnimation from '../components/ui/CoinAnimation';
import { ShoppingCart, CheckCircle, AlertCircle, X } from 'lucide-react';

interface MarketplacePageProps {
  userCoins: number;
  onCoinSpent: (amount: number, description: string) => void;
  onInventoryUpdate: (newItem: InventoryItem) => void;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({
  userCoins,
  onCoinSpent,
  onInventoryUpdate
}) => {
  const [items] = useState<MarketplaceItem[]>(mockMarketplaceItems);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>(mockMarketplaceItems);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<MarketplaceItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [coinAnimationAmount, setCoinAnimationAmount] = useState(0);

  useEffect(() => {
    const filtered = MarketplaceService.filterItems(
      items,
      selectedCategory,
      searchQuery,
      sortBy
    );
    setFilteredItems(filtered);
  }, [items, selectedCategory, searchQuery, sortBy]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleBuyWithCoins = async (item: MarketplaceItem) => {
    setIsLoading(true);
    
    try {
      const result: PurchaseResult = await MarketplaceService.purchaseWithCoins(
        item,
        userCoins,
        1
      );

      if (result.success && result.inventoryItem) {
        // Update coins
        onCoinSpent(item.priceCoins, `Purchased ${item.name}`);
        
        // Update inventory
        onInventoryUpdate(result.inventoryItem);
        
        // Show success notification
        showNotification('success', result.message);
        
        // Show coin animation
        setCoinAnimationAmount(item.priceCoins);
        setShowCoinAnimation(true);
        
        // Remove from cart if it was there
        setCartItems(prev => prev.filter(cartItem => cartItem.id !== item.id));
      } else {
        showNotification('error', result.message);
      }
    } catch (error) {
      showNotification('error', 'Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyWithCard = async (item: MarketplaceItem) => {
    setIsLoading(true);
    
    try {
      // Simulate payment processing
      showNotification('success', 'Processing payment...');
      
      const result: PurchaseResult = await MarketplaceService.purchaseWithCard(item, 1);

      if (result.success && result.inventoryItem) {
        // Update inventory
        onInventoryUpdate(result.inventoryItem);
        
        // Show success notification
        showNotification('success', result.message);
        
        // Remove from cart if it was there
        setCartItems(prev => prev.filter(cartItem => cartItem.id !== item.id));
      } else {
        showNotification('error', result.message);
      }
    } catch (error) {
      showNotification('error', 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (item: MarketplaceItem) => {
    // In a real app, this would open a detailed product modal
    alert(`Product Details:\n\n${item.name}\n${item.description}\n\nBrand: ${item.brand}\nRating: ${item.rating}/5 (${item.reviewCount} reviews)`);
  };

  const handleAddToCart = (item: MarketplaceItem) => {
    setCartItems(prev => {
      if (prev.find(cartItem => cartItem.id === item.id)) {
        return prev; // Already in cart
      }
      return [...prev, item];
    });
    showNotification('success', `${item.name} added to cart!`);
  };

  const handleViewCart = () => {
    setShowCart(true);
  };

  const handleCoinAnimationComplete = () => {
    setShowCoinAnimation(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <MarketplaceHeader
        userCoins={userCoins}
        cartItemCount={cartItems.length}
        onViewCart={handleViewCart}
      />

      <PromotionalBanner />

      <MarketplaceFilters
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onSearchChange={setSearchQuery}
      />

      <ProductGrid
        items={filteredItems}
        userCoins={userCoins}
        onBuyWithCoins={handleBuyWithCoins}
        onBuyWithCard={handleBuyWithCard}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-2 max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="mr-2 flex-shrink-0\" size={20} />
            ) : (
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
            )}
            <span className="font-merriweather text-sm">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Coin Animation */}
      <CoinAnimation
        amount={coinAnimationAmount}
        trigger={showCoinAnimation}
        onComplete={handleCoinAnimationComplete}
        position="top-right"
        type="bonus"
      />

      {/* Cart Modal (simplified for now) */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-cinzel font-bold">Shopping Cart</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600 font-merriweather">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-cinzel font-bold">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.priceUSD}</p>
                    </div>
                    <button
                      onClick={() => setCartItems(prev => prev.filter(i => i.id !== item.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;