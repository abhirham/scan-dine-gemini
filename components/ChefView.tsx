import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus } from '../types';
import { CheckCircle, Clock, Utensils } from 'lucide-react';

export const ChefView: React.FC = () => {
  const { orders, updateOrderStatus } = useRestaurant();

  // Filter active orders
  const activeOrders = orders.filter(o => 
    o.status === OrderStatus.PENDING || o.status === OrderStatus.COOKING
  ).sort((a, b) => a.timestamp - b.timestamp);

  const getElapsedTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000 / 60);
    return diff < 1 ? 'Just now' : `${diff}m ago`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Utensils className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold">Kitchen Display System</h1>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg font-mono">
            Active Orders: <span className="text-orange-400 font-bold">{activeOrders.length}</span>
        </div>
      </header>

      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-600">
            <CheckCircle size={64} className="mb-4 opacity-20" />
            <p className="text-xl">All caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeOrders.map(order => (
            <div 
                key={order.id} 
                className={`rounded-xl overflow-hidden flex flex-col border-2 ${
                    order.status === OrderStatus.PENDING 
                    ? 'bg-slate-800 border-red-500/50 animate-pulse-slow' 
                    : 'bg-slate-800 border-yellow-500/50'
                }`}
            >
              <div className={`p-4 flex justify-between items-center ${
                  order.status === OrderStatus.PENDING ? 'bg-red-900/20' : 'bg-yellow-900/20'
              }`}>
                <div>
                    <h3 className="font-bold text-lg">Table {order.tableId}</h3>
                    <span className="text-xs text-slate-400">Order #{order.id.slice(-4)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-mono">
                    <Clock size={14} />
                    {getElapsedTime(order.timestamp)}
                </div>
              </div>

              <div className="p-4 flex-1 space-y-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-lg">
                        <div className="flex gap-3">
                            <span className="font-bold text-slate-300 w-6">{item.quantity}x</span>
                            <span className="text-slate-100">{item.name}</span>
                        </div>
                    </div>
                ))}
                {order.customerNote && (
                    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600 text-yellow-200 text-sm italic">
                        Note: {order.customerNote}
                    </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-700">
                {order.status === OrderStatus.PENDING ? (
                    <button 
                        onClick={() => updateOrderStatus(order.id, OrderStatus.COOKING)}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Start Cooking
                    </button>
                ) : (
                    <button 
                        onClick={() => updateOrderStatus(order.id, OrderStatus.SERVED)}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Mark Served
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};