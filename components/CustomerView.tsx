import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { CartItem, MenuItem, OrderStatus } from '../types';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  X, 
  MapPin, 
  FileText, 
  User, 
  Utensils, 
  Coffee, 
  Sandwich, 
  Cookie, 
  Heart,
  Flame
} from 'lucide-react';
import { SmartWaiter } from './ui/SmartWaiter';

interface CustomerViewProps {
  tableId: number;
}

// Helper components for the specific design feel
const CategoryPill: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  onClick: () => void 
}> = ({ label, icon, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-2 min-w-[70px] transition-all duration-300 ${isActive ? 'opacity-100 transform scale-105' : 'opacity-60 hover:opacity-80'}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-1 transition-colors ${isActive ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-gray-600 border border-gray-100'}`}>
      {icon}
    </div>
    <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
  </button>
);

export const CustomerView: React.FC<CustomerViewProps> = ({ tableId }) => {
  const { menu, placeOrder, requestService, orders } = useRestaurant();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Entrees');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Menus');

  // Cart Logic
  const addToCart = (item: MenuItem, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const totalCartValue = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = totalCartValue * 0.1; // 10% tax example
  const finalTotal = totalCartValue + tax;

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    placeOrder(tableId, cart);
    setCart([]);
    setIsCartOpen(false);
    // In a real app, show success state
  };

  // Filtering
  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'Entrees', label: 'Entrees', icon: <Utensils size={20} /> },
    { id: 'Grab & Go', label: 'Grab & Go', icon: <Sandwich size={20} /> },
    { id: 'Drinks', label: 'Drinks', icon: <Coffee size={20} /> },
    { id: 'Snacks', label: 'Snacks', icon: <Cookie size={20} /> },
    { id: 'Extras', label: 'Extras', icon: <Plus size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans pb-24 selection:bg-red-100">
      
      {/* --- HOME SCREEN --- */}
      {!selectedItem && !isCartOpen && (
        <div className="animate-fade-in-up">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-[#F9FAFB]/95 backdrop-blur-md px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
                  <MapPin size={16} />
                  <span>Speedy Eats Natchez</span>
                </div>
                <span className="text-xs text-gray-400 font-medium ml-5">Table {tableId}</span>
              </div>
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-white rounded-full shadow-sm">
                <ShoppingBag size={22} className="text-gray-700" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search food" 
                className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-100 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          {/* Categories */}
          <div className="px-6 mb-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-4 min-w-max pb-2 pt-1">
              {categories.map(cat => (
                <CategoryPill 
                  key={cat.id}
                  label={cat.label}
                  icon={cat.icon}
                  isActive={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="px-6 pb-6">
            <h3 className="text-xl font-bold mb-4 font-['Poppins']">{activeCategory}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {filteredMenu.map((item, idx) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group animate-fade-in-up flex flex-col h-full"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="relative w-full aspect-[4/3] mb-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-[1.5rem] shadow-sm" />
                    
                    {/* Heart Icon (top right) - Only for Popular Items */}
                    {item.isPopular && (
                      <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm">
                          <div className="absolute top-0 right-0">
                              <span className="sr-only">Like</span>
                          </div>
                          <Heart size={16} className="text-red-500 fill-red-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1">
                    {/* Poppins Font for Name - Semi Bold */}
                    <h4 className="font-['Poppins'] font-semibold text-gray-900 text-lg leading-tight mb-2">{item.name}</h4>
                    
                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 mb-4">
                        {item.description}
                    </p>

                    <div className="flex items-end justify-between mt-auto">
                        {/* Poppins Font for Price, styled like the reference - Semi Bold */}
                        <span className="font-['Poppins'] text-xl font-semibold text-gray-900 flex items-baseline gap-0.5">
                            <span className="text-sm align-top pt-0.5">$</span>{item.price}
                        </span>
                        
                        {/* Spiciness Indicators */}
                        <div className="flex gap-0.5 mb-1">
                            {item.isSpicy && (
                               <>
                                 <Flame size={14} className="text-red-500 fill-red-500" />
                                 <Flame size={14} className="text-red-300 fill-red-300" />
                                 <Flame size={14} className="text-gray-200 fill-gray-200" />
                               </>
                            )}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredMenu.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p>No items found in this category.</p>
                </div>
            )}
          </div>

          {/* Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 safe-area-bottom">
            {[
              { id: 'Menus', icon: <Utensils size={24} />, label: 'Menus' },
              { id: 'Orders', icon: <FileText size={24} />, label: 'Orders' },
              { id: 'Account', icon: <User size={24} />, label: 'Account' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-red-600' : 'text-gray-400'}`}
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- PRODUCT DETAIL SCREEN (MODAL) --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-slide-up">
          <div className="relative h-72 w-full bg-gray-100">
             <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
             <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-800 shadow-sm hover:bg-white"
             >
                <X size={20} />
             </button>
             {/* Pagination dots simulation */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
             </div>
          </div>

          <div className="px-6 py-6 pb-32">
            <div className="flex justify-between items-start mb-6">
                {/* Semi Bold for detail view too */}
                <h1 className="text-2xl font-['Poppins'] font-semibold text-gray-900 w-3/4 leading-tight">{selectedItem.name}</h1>
                <span className="text-2xl font-['Poppins'] font-semibold text-teal-500">${selectedItem.price}</span>
            </div>

            {/* Nutrition Summary */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nutrition Summary</h3>
                <div className="bg-gray-50 rounded-2xl p-4 flex justify-between border border-gray-100">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Calories</span>
                        <span className="font-bold text-gray-900">{selectedItem.calories || 350}g</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Protein</span>
                        <span className="font-bold text-gray-900">{selectedItem.protein || '20g'}</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Fats</span>
                        <span className="font-bold text-gray-900">{selectedItem.fats || '10g'}</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Carbs</span>
                        <span className="font-bold text-gray-900">{selectedItem.carbs || '45g'}</span>
                    </div>
                </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ingredients</h3>
                <ul className="space-y-3">
                    {selectedItem.ingredients?.map((ing, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                            {ing}
                        </li>
                    )) || <p className="text-sm text-gray-400">Ingredients info unavailable.</p>}
                </ul>
            </div>
             
             {/* Allergens */}
             {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                 <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Allergens</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedItem.allergens.map(a => (
                            <span key={a} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">{a}</span>
                        ))}
                    </div>
                 </div>
             )}
          </div>

          {/* Sticky Bottom Action */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 safe-area-bottom">
            <button 
                onClick={() => { addToCart(selectedItem); setSelectedItem(null); }}
                className="w-full bg-[#B91C1C] text-white text-lg font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-colors"
            >
                Add to Cart • ${selectedItem.price}
            </button>
          </div>
        </div>
      )}

      {/* --- CART SCREEN --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <button onClick={() => setIsCartOpen(false)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full">
                    <X size={24} />
                </button>
                <span className="font-bold text-lg font-['Poppins']">Cart</span>
                <div className="w-8"></div> {/* Spacer */}
            </div>

            <div className="px-6 py-6 pb-40">
                {/* Location Card (Simulated Address) */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Table {tableId}</h3>
                        <p className="text-sm text-gray-400">1234 Address Blvd</p>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-6 mb-8">
                    {cart.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">Your cart is empty.</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold font-['Poppins'] text-gray-900 text-sm mb-1">{item.name}</h4>
                                    <p className="font-semibold font-['Poppins'] text-teal-500 text-sm">${item.price}</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600"><Minus size={14}/></button>
                                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-800 hover:text-red-600"><Plus size={14}/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add More Link */}
                <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 mb-8">
                    <span className="font-medium text-gray-900 text-sm">Need anything else?</span>
                    <button onClick={() => setIsCartOpen(false)} className="text-red-600 font-bold text-sm hover:underline">+Add More</button>
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-8">
                    <h3 className="font-bold text-gray-900 mb-2">Summary</h3>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900">${totalCartValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Tax</span>
                        <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Delivery Fee</span>
                        <span className="font-medium text-gray-900">$0.00</span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-3">Payment</h3>
                    <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-6 bg-orange-500/20 rounded flex items-center justify-center">
                            <div className="flex -space-x-1">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            </div>
                        </div>
                        <span className="font-mono text-sm text-gray-600 flex-1">•••• •••• •••• 5678</span>
                        <span className="text-xs font-bold text-gray-400">Change</span>
                    </div>
                </div>
            </div>

            {/* Sticky Checkout */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 safe-area-bottom">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-gray-400 text-sm font-medium">Total</span>
                    <span className="font-semibold text-2xl text-gray-900 font-['Poppins']">${finalTotal.toFixed(2)}</span>
                </div>
                <button 
                    onClick={handlePlaceOrder}
                    disabled={cart.length === 0}
                    className="w-full bg-[#B91C1C] disabled:bg-gray-300 text-white text-lg font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-colors"
                >
                    Checkout
                </button>
            </div>
        </div>
      )}

      <SmartWaiter />
    </div>
  );
};