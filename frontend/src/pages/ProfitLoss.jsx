import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { FaChartLine, FaBoxes, FaMoneyBillWave, FaPercentage, FaDownload } from 'react-icons/fa';

export default function ProfitLoss() {
  const [profitLoss, setProfitLoss] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProfitLoss();
    }
  }, [dateRange, user]);

  const fetchProfitLoss = async () => {
    try {
      const response = await fetch(
        `/api/reports/profit-loss?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setProfitLoss(data);
    } catch (error) {
      console.error('Failed to load profit/loss report:', error);
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

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Access denied. Admin only.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profit & Loss Report</h1>
      
      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Start Date</label>
            <input
              type="date"
              className="input-field"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input
              type="date"
              className="input-field"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Quick Select</label>
            <select
              className="input-field"
              onChange={(e) => {
                const today = new Date();
                const end = today.toISOString().split('T')[0];
                let start = '';
                switch (e.target.value) {
                  case 'today':
                    start = end;
                    break;
                  case 'week':
                    const weekAgo = new Date(today.setDate(today.getDate() - 7));
                    start = weekAgo.toISOString().split('T')[0];
                    break;
                  case 'month':
                    const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
                    start = monthAgo.toISOString().split('T')[0];
                    break;
                  case 'year':
                    const yearAgo = new Date(today.setFullYear(today.getFullYear() - 1));
                    start = yearAgo.toISOString().split('T')[0];
                    break;
                }
                if (start) setDateRange({ start_date: start, end_date: end });
              }}
            >
              <option value="">Custom Range</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
        </div>
      </div>
      
      {profitLoss && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Sales (Omzet)</p>
                  <p className="text-2xl font-bold text-green-600">{formatRupiah(profitLoss.summary?.total_sales)}</p>
                </div>
                <FaMoneyBillWave className="text-green-500 text-3xl" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Cost (HPP)</p>
                  <p className="text-2xl font-bold text-red-600">{formatRupiah(profitLoss.summary?.total_cost)}</p>
                </div>
                <FaBoxes className="text-red-500 text-3xl" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Gross Profit</p>
                  <p className="text-2xl font-bold text-blue-600">{formatRupiah(profitLoss.summary?.total_profit)}</p>
                </div>
                <FaChartLine className="text-blue-500 text-3xl" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Profit Margin</p>
                  <p className="text-2xl font-bold text-purple-600">{profitLoss.summary?.profit_margin || 0}%</p>
                </div>
                <FaPercentage className="text-purple-500 text-3xl" />
              </div>
            </div>
          </div>
          
          {/* Profit Calculation Explanation */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">📊 Profit Calculation Explanation</h3>
            <div className="text-sm space-y-1">
              <p>• <strong>Total Sales (Omzet)</strong> = Σ(Harga Jual × Quantity) = {formatRupiah(profitLoss.summary?.total_sales)}</p>
              <p>• <strong>Total Cost (HPP)</strong> = Σ(Harga Modal × Quantity) = {formatRupiah(profitLoss.summary?.total_cost)}</p>
              <p>• <strong>Gross Profit</strong> = Total Sales - Total Cost = {formatRupiah(profitLoss.summary?.total_profit)}</p>
              <p>• <strong>Profit Margin</strong> = (Gross Profit ÷ Total Sales) × 100% = {profitLoss.summary?.profit_margin || 0}%</p>
            </div>
          </div>
          
          {/* Product Profit Details */}
          {profitLoss.product_profit?.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Profit per Product</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-center">Qty Sold</th>
                      <th className="px-4 py-2 text-right">Sales</th>
                      <th className="px-4 py-2 text-right">Cost</th>
                      <th className="px-4 py-2 text-right">Profit</th>
                      <th className="px-4 py-2 text-center">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitLoss.product_profit.map((product, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{product.name}</td>
                        <td className="px-4 py-2 text-center">{product.quantity_sold}</td>
                        <td className="px-4 py-2 text-right">{formatRupiah(product.total_sales)}</td>
                        <td className="px-4 py-2 text-right">{formatRupiah(product.total_cost)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600">{formatRupiah(product.profit)}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${product.margin >= 20 ? 'bg-green-100 text-green-700' : product.margin >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {product.margin}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Daily Breakdown */}
          {profitLoss.daily_breakdown?.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Daily Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-center">Transactions</th>
                      <th className="px-4 py-2 text-right">Sales</th>
                      <th className="px-4 py-2 text-right">Cost</th>
                      <th className="px-4 py-2 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitLoss.daily_breakdown.map((day, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{day.date}</td>
                        <td className="px-4 py-2 text-center">{day.transactions}</td>
                        <td className="px-4 py-2 text-right">{formatRupiah(day.sales)}</td>
                        <td className="px-4 py-2 text-right">{formatRupiah(day.cost)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600">{formatRupiah(day.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Inventory Value */}
          {profitLoss.inventory && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Current Inventory Value</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Selling Value</p>
                  <p className="text-xl font-bold text-green-600">{formatRupiah(profitLoss.inventory.selling_value)}</p>
                  <p className="text-xs text-gray-500">If all sold at current price</p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Cost Value (Modal)</p>
                  <p className="text-xl font-bold text-orange-600">{formatRupiah(profitLoss.inventory.cost_value)}</p>
                  <p className="text-xs text-gray-500">Total capital tied in stock</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Potential Profit</p>
                  <p className="text-xl font-bold text-blue-600">{formatRupiah(profitLoss.inventory.potential_profit)}</p>
                  <p className="text-xs text-gray-500">If all stock sold</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {!profitLoss && (
        <div className="text-center py-8 text-gray-500">
          Loading report data...
        </div>
      )}
    </div>
  );
}