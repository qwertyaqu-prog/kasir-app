import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { FaBox, FaShoppingCart, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/reports/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const formatRupiah = (number) => {
    if (!number && number !== 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  if (!dashboardData) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  const stats = [
    { title: 'Today\'s Sales', value: formatRupiah(dashboardData.today?.sales), icon: FaChartLine, color: 'bg-green-500' },
    { title: 'Today\'s Transactions', value: dashboardData.today?.transactions, icon: FaShoppingCart, color: 'bg-blue-500' },
    { title: 'Total Products', value: dashboardData.products?.total, icon: FaBox, color: 'bg-purple-500' },
    { title: 'Low Stock Alert', value: dashboardData.products?.low_stock, icon: FaExclamationTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                <stat.icon />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Monthly Trend Chart */}
      {dashboardData.monthly_trend && dashboardData.monthly_trend.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Monthly Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatRupiah(value)} />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Line type="monotone" dataKey="total_sales" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}