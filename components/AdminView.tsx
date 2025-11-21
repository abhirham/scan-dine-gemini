import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus, MenuItem, ModificationGroup } from '../types';
import { 
  LayoutDashboard, 
  DollarSign, 
  AlertCircle, 
  RefreshCcw, 
  CheckCircle, 
  Users,
  Coffee,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AdminView: React.FC = () => {
  const { 
    orders, 
    serviceRequests, 
    resolveServiceRequest, 
    processRefund, 
    processPayment,
    menu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useRestaurant();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'requests' | 'menu'>('overview');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: 'Entrees',
    image: '',
    isSpicy: false,
    isVegetarian: false,
    isPopular: false
  };
  const [formData, setFormData] = useState(initialFormState);
  const [modifications, setModifications] = useState<ModificationGroup[]>([]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setModifications([]);
    setIsMenuModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        image: item.image,
        isSpicy: !!item.isSpicy,
        isVegetarian: !!item.isVegetarian,
        isPopular: !!item.isPopular
    });
    setModifications(item.modifications ? [...item.modifications] : []);
    setIsMenuModalOpen(true);
  };

  // Modifications Logic
  const addModificationGroup = () => {
    setModifications([
      ...modifications,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        options: [],
        required: false,
        multiSelect: false
      }
    ]);
  };

  const updateModificationGroup = (index: number, field: keyof ModificationGroup, value: any) => {
    const newMods = [...modifications];
    newMods[index] = { ...newMods[index], [field]: value };
    setModifications(newMods);
  };

  const updateModificationOptions = (index: number, optionsString: string) => {
    const options = optionsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    updateModificationGroup(index, 'options', options);
  };

  const removeModificationGroup = (index: number) => {
    setModifications(modifications.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category as any,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        isSpicy: formData.isSpicy,
        isVegetarian: formData.isVegetarian,
        isPopular: formData.isPopular,
        protein: editingItem?.protein || '0g', 
        fats: editingItem?.fats || '0g', 
        carbs: editingItem?.carbs || '0g', 
        sugar: editingItem?.sugar || '0g', 
        ingredients: editingItem?.ingredients || [], 
        allergens: editingItem?.allergens || [],
        modifications: modifications
    };

    if (editingItem) {
        updateMenuItem({ ...editingItem, ...itemData });
    } else {
        addMenuItem(itemData);
    }
    setIsMenuModalOpen(false);
  };

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

  // Simple Chart Data
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
            <button 
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'menu' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <BookOpen size={20} /> Menu Management
            </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
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

          {activeTab === 'menu' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
                    <button 
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} /> Add Item
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4">Item</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {menu.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-200" />
                                        <div>
                                            <div className="font-bold text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500 max-w-[200px] truncate">{item.description}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{item.category}</span>
                                    </td>
                                    <td className="p-4 font-mono font-medium text-gray-700">
                                        ${item.price.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            {item.isPopular && <span className="w-2 h-2 bg-red-500 rounded-full" title="Popular"></span>}
                                            {item.isVegetarian && <span className="w-2 h-2 bg-green-500 rounded-full" title="Vegetarian"></span>}
                                            {item.isSpicy && <span className="w-2 h-2 bg-orange-500 rounded-full" title="Spicy"></span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => { if(window.confirm('Delete item?')) deleteMenuItem(item.id) }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

        </div>

        {/* Menu Modal */}
        {isMenuModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                        <button onClick={() => setIsMenuModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSave} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-900"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input 
                                    type="number" 
                                    required
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-900"
                                >
                                    <option value="Entrees">Entrees</option>
                                    <option value="Grab & Go">Grab & Go</option>
                                    <option value="Drinks">Drinks</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Extras">Extras</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea 
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input 
                                type="url" 
                                placeholder="https://..."
                                value={formData.image}
                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-900"
                            />
                        </div>

                        <div className="flex gap-6">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isPopular}
                                    onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 bg-white"
                                />
                                <span className="text-sm text-gray-700">Popular</span>
                            </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isSpicy}
                                    onChange={(e) => setFormData({...formData, isSpicy: e.target.checked})}
                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 bg-white"
                                />
                                <span className="text-sm text-gray-700">Spicy</span>
                            </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isVegetarian}
                                    onChange={(e) => setFormData({...formData, isVegetarian: e.target.checked})}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 bg-white"
                                />
                                <span className="text-sm text-gray-700">Vegetarian</span>
                            </label>
                        </div>

                        {/* Modifications Section */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-gray-800">Allowed Modifications</label>
                                <button 
                                    type="button"
                                    onClick={addModificationGroup}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
                                >
                                    + Add Group
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {modifications.map((group, idx) => (
                                    <div key={group.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Group {idx + 1}</h4>
                                            <button 
                                                type="button"
                                                onClick={() => removeModificationGroup(idx)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Group Name (e.g. Spice Level)</label>
                                                <input 
                                                    type="text" 
                                                    value={group.name}
                                                    onChange={(e) => updateModificationGroup(idx, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-gray-900"
                                                    placeholder="Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Options (Comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={group.options.join(', ')}
                                                    onChange={(e) => updateModificationOptions(idx, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-gray-900"
                                                    placeholder="Mild, Medium, Hot"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                             <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={group.required}
                                                    onChange={(e) => updateModificationGroup(idx, 'required', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 rounded bg-white"
                                                />
                                                <span className="text-xs text-gray-700">Mandatory Selection</span>
                                            </label>
                                             <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={group.multiSelect}
                                                    onChange={(e) => updateModificationGroup(idx, 'multiSelect', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 rounded bg-white"
                                                />
                                                <span className="text-xs text-gray-700">Allow Multiple Selections</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                {modifications.length === 0 && (
                                    <p className="text-sm text-gray-400 italic text-center py-2">No modifications added yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Save Item
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};