import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus } from '../types';
import { 
  LayoutDashboard, 
  DollarSign, 
  AlertCircle, 
  RefreshCcw, 
  CheckCircle, 
  Users,
  Coffee
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AdminView: React.FC = () => {
  const { orders, serviceRequests, resolveServiceRequest, processRefund, processPayment } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'requests'>('overview');

  // Derived Metrics
  const totalRevenue = orders
    .filter(o => o.status === OrderStatus.PAID)
    .reduce((acc, o) => acc + o.totalAmount, 0);
  
  const pendingRevenue = orders
    .filter(o => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED)
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const activeTables = new Set(
    orders
      .filter(o => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED)
      .map(o => o.tableId)
  ).size;

  // Simple Chart Data (Revenue by Table for example)
  const revenueByTable = orders
    .filter(o => o.status === OrderStatus.PAID)
    .reduce((acc, o) => {
      const table = `T${o.tableId}`;
      acc[table] = (acc[table] || 0) + o.totalAmount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(revenueByTable).map(([name, value]) => ({ name, value }));

  const unpaidOrders = orders.filter(o => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED);
  const paidOrders = orders.filter(o => o.status === OrderStatus.PAID);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <LayoutDashboard size={18} />
                </div>
                DineFlow
            </h1>
            <p className="text-xs text-gray-500 mt-1 ml-10">Admin Console</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <LayoutDashboard size={20} /> Overview
            </button>
            <button 
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'payments' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <DollarSign size={20} /> Payments & Refunds
            </button>
            <button 
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'requests' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <div className="relative">
                    <AlertCircle size={20} />
                    {serviceRequests.filter(r => r.status === 'PENDING').length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </div>
                 Service Requests
            </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl"><DollarSign size={24} /></div>
                    <span className="text-sm text-gray-400 font-medium">+2.5%</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</h3>
                <p className="text-sm text-gray-500 mt-1">Total Revenue Today</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Coffee size={24} /></div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{activeTables}</h3>
                <p className="text-sm text-gray-500 mt-1">Active Tables</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users size={24} /></div>
                    <span className="text-sm text-gray-400 font-medium">Pending: ${pendingRevenue.toFixed(2)}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{unpaidOrders.length}</h3>
                <p className="text-sm text-gray-500 mt-1">Open Orders</p>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-6">Revenue by Table</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Payments */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Pending Payments</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {unpaidOrders.length === 0 ? <p className="text-gray-400">No pending payments.</p> : unpaidOrders.map(order => (
                            <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <div className="font-bold text-gray-800">Table {order.tableId}</div>
                                    <div className="text-sm text-gray-500">Order #{order.id.slice(-4)} • {order.items.length} items</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-lg font-bold text-gray-900">${order.totalAmount}</div>
                                    <button 
                                        onClick={() => processPayment(order.id)}
                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        title="Mark Paid"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completed / Refunds */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                        {paidOrders.slice().reverse().map(order => (
                            <div key={order.id} className="flex justify-between items-center p-4 border-b last:border-0">
                                <div>
                                    <div className="font-medium text-gray-800">Table {order.tableId}</div>
                                    <div className="text-xs text-gray-400">Paid at {new Date(order.timestamp).toLocaleTimeString()}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="font-medium text-gray-900">${order.totalAmount}</div>
                                    <button 
                                        onClick={() => {
                                            if(window.confirm("Are you sure you want to refund this order?")) {
                                                processRefund(order.id);
                                            }
                                        }}
                                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-full hover:bg-red-50 flex items-center gap-1"
                                    >
                                        <RefreshCcw size={12} /> Refund
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'requests' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Live Service Requests</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-2">
                        {serviceRequests.length === 0 && <p className="text-gray-400">No active requests.</p>}
                        {serviceRequests.slice().reverse().map(req => (
                            <div key={req.id} className={`flex justify-between items-center p-4 rounded-xl border ${req.status === 'PENDING' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${req.type === 'BILL' ? 'bg-green-200 text-green-800' : req.type === 'WATER' ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'}`}>
                                        {req.type === 'BILL' ? <DollarSign size={16} /> : req.type === 'WATER' ? <AlertCircle size={16} /> : <Users size={16} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">Table {req.tableId}</div>
                                        <div className="text-sm text-gray-600">Requested {req.type} • {Math.floor((Date.now() - req.timestamp)/1000/60)}m ago</div>
                                    </div>
                                </div>
                                {req.status === 'PENDING' ? (
                                    <button 
                                        onClick={() => resolveServiceRequest(req.id)}
                                        className="px-4 py-2 bg-white border border-gray-200 shadow-sm text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                                    >
                                        Mark Resolved
                                    </button>
                                ) : (
                                    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-bold">Resolved</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};