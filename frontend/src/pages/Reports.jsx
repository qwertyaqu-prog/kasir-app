import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { FaCalendar, FaBox, FaChartLine } from 'react-icons/fa';

export default function Reports() {
  const [dailyReport, setDailyReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDailyReport();
      fetchStockReport();
    }
  }, [selectedDate, user]);
  
  const fetchDailyReport = async () => {
    try {
      const response = await fetch(`/api/reports/daily?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDailyReport(data);
    } catch (error) {
      console.error('Failed to load daily report');
    }
  };
  
  const fetchStockReport = async () => {
    try {
      const response = await fetch('/api/reports/stock', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStockReport(data);
    } catch (error) {
      console.error('Failed to load stock report');
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
      <h1 className="text-2xl font-bold mb-6">Sales Reports</h1>
      
      {/* Daily Report */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FaCalendar className="text-blue-600" />
            <h2 className="text-xl font-semibold">Daily Sales Report</h2>
          </div>
          <input
            type="date"
            className="input-field w-auto"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        
        {dailyReport && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Total Transactions</div>
                <div className="text-2xl font-bold">{dailyReport.summary.total_transactions}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Total Sales</div>
                <div className="text-2xl font-bold">{formatRupiah(dailyReport.summary.total_sales)}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 mb-1">Average Transaction</div>
                <div className="text-2xl font-bold">{formatRupiah(dailyReport.summary.average_transaction)}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">Total Paid</div>
                <div className="text-2xl font-bold">{formatRupiah(dailyReport.summary.total_paid)}</div>
              </div>
            </div>
            
            {dailyReport.top_products?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Top 5 Best Selling Products</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-center">Quantity Sold</th>
                      <th className="px-3 py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReport.top_products.map((product, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{product.name}</td>
                        <td className="px-3 py-2 text-center">{product.total_sold}</td>
                        <td className="px-3 py-2 text-right">{formatRupiah(product.total_revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Stock Report */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaBox className="text-blue-600" />
          <h2 className="text-xl font-semibold">Stock Alert Report</h2>
        </div>
        
        {stockReport && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 mb-1">Low Stock Products</div>
                <div className="text-2xl font-bold">{stockReport.total_products}</div>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="text-sm text-teal-600 mb-1">Inventory Value (Selling)</div>
                <div className="text-2xl font-bold">{formatRupiah(stockReport.total_selling_value)}</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-emerald-600 mb-1">Inventory Value (Cost)</div>
                <div className="text-2xl font-bold">{formatRupiah(stockReport.total_cost_value)}</div>
              </div>
            </div>
            
            {stockReport.low_stock?.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Current Stock</th>
                    <th className="px-3 py-2 text-center">Min Stock</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReport.low_stock.map(product => (
                    <tr key={product.id} className="border-t">
                      <td className="px-3 py-2">{product.name}</td>
                      <td className="px-3 py-2 text-center font-bold text-red-600">{product.stock}</td>
                      <td className="px-3 py-2 text-center">{product.min_stock}</td>
                      <td className="px-3 py-2 text-right">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          Need Restock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-green-600 py-4">
                ✓ All stock levels are sufficient
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}