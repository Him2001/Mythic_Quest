import { MarketplaceItem, InventoryItem, PurchaseResult, CoinTransaction } from '../types';

export class MarketplaceService {
  private static readonly STORAGE_KEY = 'mythic_marketplace_data';

  static getStoredData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : { inventory: [], transactions: [] };
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
      return { inventory: [], transactions: [] };
    }
  }

  static saveStoredData(data: { inventory: InventoryItem[]; transactions: CoinTransaction[] }) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save marketplace data:', error);
    }
  }

  static async purchaseWithCoins(
    item: MarketplaceItem,
    userCoins: number,
    quantity: number = 1
  ): Promise<PurchaseResult> {
    const totalCost = item.priceCoins * quantity;

    if (userCoins < totalCost) {
      return {
        success: false,
        message: `Insufficient coins. You need ${totalCost} coins but only have ${userCoins}.`
      };
    }

    if (!item.inStock) {
      return {
        success: false,
        message: 'This item is currently out of stock.'
      };
    }

    try {
      // Create inventory item
      const inventoryItem: InventoryItem = {
        id: crypto.randomUUID(),
        marketplaceItemId: item.id,
        purchaseDate: new Date(),
        purchaseMethod: 'coins',
        pricePaid: totalCost,
        quantity
      };

      // Create transaction record
      const transaction: CoinTransaction = {
        id: crypto.randomUUID(),
        amount: -totalCost,
        type: 'purchase',
        description: `Purchased ${item.name} (x${quantity})`,
        timestamp: new Date()
      };

      // Update stored data
      const storedData = this.getStoredData();
      storedData.inventory.push(inventoryItem);
      storedData.transactions.push(transaction);
      this.saveStoredData(storedData);

      return {
        success: true,
        message: `Successfully purchased ${item.name}! Check your inventory.`,
        transactionId: transaction.id,
        inventoryItem
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        message: 'Purchase failed due to a technical error. Please try again.'
      };
    }
  }

  static async purchaseWithCard(
    item: MarketplaceItem,
    quantity: number = 1
  ): Promise<PurchaseResult> {
    if (!item.inStock) {
      return {
        success: false,
        message: 'This item is currently out of stock.'
      };
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would integrate with RevenueCat or Stripe
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (!success) {
        return {
          success: false,
          message: 'Payment failed. Please check your payment method and try again.'
        };
      }

      // Create inventory item
      const inventoryItem: InventoryItem = {
        id: crypto.randomUUID(),
        marketplaceItemId: item.id,
        purchaseDate: new Date(),
        purchaseMethod: 'card',
        pricePaid: item.priceUSD * quantity,
        quantity
      };

      // Update stored data
      const storedData = this.getStoredData();
      storedData.inventory.push(inventoryItem);
      this.saveStoredData(storedData);

      return {
        success: true,
        message: `Successfully purchased ${item.name}! Check your inventory.`,
        transactionId: crypto.randomUUID(),
        inventoryItem
      };
    } catch (error) {
      console.error('Card purchase failed:', error);
      return {
        success: false,
        message: 'Payment processing failed. Please try again.'
      };
    }
  }

  static getUserInventory(): InventoryItem[] {
    const data = this.getStoredData();
    return data.inventory || [];
  }

  static getPurchaseTransactions(): CoinTransaction[] {
    const data = this.getStoredData();
    return data.transactions || [];
  }

  static filterItems(
    items: MarketplaceItem[],
    category: string,
    searchQuery: string,
    sortBy: string
  ): MarketplaceItem[] {
    let filtered = [...items];

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort items
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.priceUSD - b.priceUSD);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.priceUSD - a.priceUSD);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // In a real app, this would sort by creation date
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Featured items first, then by rating
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
        break;
    }

    return filtered;
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  static calculateSavings(item: MarketplaceItem): { usdSavings: number; coinSavings: number } {
    if (!item.discount) {
      return { usdSavings: 0, coinSavings: 0 };
    }

    return {
      usdSavings: item.discount.originalPriceUSD - item.priceUSD,
      coinSavings: item.discount.originalPriceCoins - item.priceCoins
    };
  }
}