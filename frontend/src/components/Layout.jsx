import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaCashRegister, FaBox, FaHistory, FaChartBar, 
  FaTachometerAlt, FaSignOutAlt, FaUser, FaUsers, 
  FaChartLine, FaMoneyBillWave 
} from 'react-icons/fa';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };
  
  const menuItems = [
    { path: '/pos', icon: FaCashRegister, label: 'POS', roles: ['admin', 'kasir'] },
    { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['admin', 'kasir'] },
    { path: '/products', icon: FaBox, label: 'Products', roles: ['admin', 'kasir'] },
    { path: '/transactions', icon: FaHistory, label: 'Transactions', roles: ['admin', 'kasir'] },
    { path: '/reports', icon: FaChartBar, label: 'Reports', roles: ['admin'] },
    { path: '/profit-loss', icon: FaChartLine, label: 'Profit & Loss', roles: ['admin'] },
    { path: '/users', icon: FaUsers, label: 'Users', roles: ['admin'] },
  ];
  
  const visibleMenu = menuItems.filter(item => item.roles.includes(user?.role));
  
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaMoneyBillWave className="text-green-400" />
            Kasir Pro
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <FaUser />
            <span>{user?.fullname || user?.username}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">{user?.role}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-3">
          {visibleMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${
                location.pathname === item.path 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full text-gray-300"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}