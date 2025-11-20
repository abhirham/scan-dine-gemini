import React, { useState } from 'react';
import { RestaurantProvider } from './context/RestaurantContext';
import { CustomerView } from './components/CustomerView';
import { ChefView } from './components/ChefView';
import { AdminView } from './components/AdminView';
import { Role } from './types';
import { Utensils, User, ShieldCheck } from 'lucide-react';

const RoleSelector: React.FC<{ onSelect: (role: Role, tableId?: number) => void }> = ({ onSelect }) => {
  const [tableId, setTableId] = useState<string>('1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
                <Utensils size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DineFlow AI</h1>
            <p className="text-gray-500 mt-2">Select your portal to continue</p>
        </div>

        <div className="space-y-4">
            {/* Customer Flow */}
            <div className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 transition-colors group text-left">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <User size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800">Customer</h3>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        min="1"
                        value={tableId}
                        onChange={(e) => setTableId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Table #"
                    />
                    <button 
                        onClick={() => onSelect(Role.CUSTOMER, parseInt(tableId) || 1)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                        Scan QR
                    </button>
                </div>
            </div>

            <button 
                onClick={() => onSelect(Role.CHEF)}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-orange-500 transition-colors group flex items-center gap-3 text-left"
            >
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Utensils size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Kitchen Display</h3>
                    <p className="text-xs text-gray-500">For Chefs & Kitchen Staff</p>
                </div>
            </button>

            <button 
                onClick={() => onSelect(Role.ADMIN)}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-500 transition-colors group flex items-center gap-3 text-left"
            >
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Admin Portal</h3>
                    <p className="text-xs text-gray-500">Reception & Management</p>
                </div>
            </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.NONE);
  const [activeTableId, setActiveTableId] = useState<number>(1);

  const handleRoleSelect = (selectedRole: Role, tableId?: number) => {
    setRole(selectedRole);
    if (tableId) setActiveTableId(tableId);
  };

  return (
    <RestaurantProvider>
      {role === Role.NONE && <RoleSelector onSelect={handleRoleSelect} />}
      {role === Role.CUSTOMER && <CustomerView tableId={activeTableId} />}
      {role === Role.CHEF && <ChefView />}
      {role === Role.ADMIN && <AdminView />}
    </RestaurantProvider>
  );
};

export default App;