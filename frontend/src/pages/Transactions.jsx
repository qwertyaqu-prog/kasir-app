import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { FaSearch, FaPrint } from 'react-icons/fa';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const token = useAuthStore((state) => state.token);
  
  useEffect(() => {
    fetchTransactions();
  }, [searchDate]);
  
  const fetchTransactions = async () => {
    try {
      let url = '/api/transactions?limit=200';
      if (searchDate) {
        url += `&start_date=${searchDate}&end_date=${searchDate}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions');
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
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID');
  };
  
  const reprintReceipt = (transaction) => {
    const receipt = `
================================
        KASIR PRO
================================
Invoice: ${transaction.invoice_number}
Date: ${formatDate(transaction.created_at)}
Cashier: ${transaction.username}
Customer: ${transaction.customer_name || 'Umum'}
--------------------------------
Total: ${formatRupiah(transaction.total)}
Paid: ${formatRupiah(transaction.paid)}
Change: ${formatRupiah(transaction.change)}
--------------------------------
Thank you!
================================
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Reprint Receipt</title>
          <style>
            body { font-family: monospace; white-space: pre; font-size: 12px; margin: 0; padding: 20px; }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>${receipt}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      <div className="mb-4 flex gap-4">
        <div className="relative flex-1 max-w-xs">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="date"
            className="input-field pl-10"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
        <button
          onClick={() => setSearchDate('')}
          className="btn-secondary px-4"
        >
          Reset
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Invoice</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Cashier</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-center">Method</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm">{transaction.invoice_number}</td>
                  <td className="px-4 py-2 text-sm">{formatDate(transaction.created_at)}</td>
                  <td className="px-4 py-2">{transaction.username}</td>
                  <td className="px-4 py-2">{transaction.customer_name || 'Umum'}</td>
                  <td className="px-4 py-2 text-right font-semibold">{formatRupiah(transaction.total)}</td>
                  <td className="px-4 py-2 text-right">{formatRupiah(transaction.paid)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs uppercase">
                      {transaction.payment_method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => reprintReceipt(transaction)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Reprint Receipt"
                    >
                      <FaPrint />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}