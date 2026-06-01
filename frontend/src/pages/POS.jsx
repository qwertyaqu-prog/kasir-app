import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaTrash, FaPrint, FaSearch, FaUser } from 'react-icons/fa';
import { useAuthStore } from '../stores/authStore';

export default function POS() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [paid, setPaid] = useState('');
  const [customerName, setCustomerName] = useState('Umum');
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };
  
  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Stock is empty!');
      return;
    }
    
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Stock not enough!');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        cost_price: product.cost_price || 0,
        quantity: 1,
        subtotal: product.price
      }]);
    }
    toast.success(`${product.name} added to cart`);
  };
  
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };
  
  const updateQuantity = (productId, quantity) => {
    const item = cart.find(i => i.product_id === productId);
    const product = products.find(p => p.id === productId);
    
    if (quantity <= 0) {
      removeFromCart(productId);
    } else if (quantity > product.stock) {
      toast.error('Stock not enough!');
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      ));
    }
  };
  
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal;
  const change = paid ? paid - total : 0;
  
  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }
    
    if (!paid || paid < total) {
      toast.error('Payment amount is insufficient!');
      return;
    }
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          paid: parseFloat(paid),
          payment_method: 'cash',
          customer_name: customerName,
          discount: 0,
          notes: ''
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      toast.success(`Transaction success! Invoice: ${data.invoice_number}`);
      printReceipt(data, cart, customerName, user);
      setCart([]);
      setPaid('');
      setCustomerName('Umum');
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const printReceipt = (transaction, items, customer, cashier) => {
    const receipt = `
================================
        KASIR PRO
================================
Invoice: ${transaction.invoice_number}
Date: ${new Date().toLocaleString()}
Cashier: ${cashier?.fullname || cashier?.username}
Customer: ${customer}
--------------------------------
Item           Qty    Price    Total
${items.map(item => `
${item.name.substring(0, 15)}${' '.repeat(15 - Math.min(15, item.name.length))}${item.quantity}${' '.repeat(4)}${formatRupiah(item.price)}${' '.repeat(5)}${formatRupiah(item.subtotal)}`).join('')}
--------------------------------
Subtotal: ${formatRupiah(transaction.subtotal)}
Total: ${formatRupiah(transaction.total)}
Paid: ${formatRupiah(transaction.paid)}
Change: ${formatRupiah(transaction.change)}
--------------------------------
Thank you for shopping!
================================
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
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
  
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
  };
  
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  );
  
  return (
    <div className="flex h-full">
      {/* Products Grid */}
      <div className="flex-1 p-4">
        <div className="mb-4 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow text-left border hover:border-blue-300"
            >
              <div className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</div>
              <div className="text-blue-600 font-bold">{formatRupiah(product.price)}</div>
              <div className="text-xs text-gray-500">Stock: {product.stock}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Cart */}
      <div className="w-96 bg-white border-l flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-lg">Shopping Cart</h2>
          <div className="mt-2">
            <label className="text-xs text-gray-500">Customer Name</label>
            <div className="flex items-center gap-2 mt-1">
              <FaUser className="text-gray-400" />
              <input
                type="text"
                className="input-field text-sm py-1"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {cart.map(item => (
            <div key={item.product_id} className="flex items-center justify-between mb-3 pb-3 border-b">
              <div className="flex-1">
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{formatRupiah(item.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-16 px-2 py-1 border rounded text-center text-sm"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 0)}
                  min="1"
                />
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          
          {cart.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No items in cart
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between mb-2">
            <span>Total:</span>
            <span className="font-bold text-xl">{formatRupiah(total)}</span>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Payment Amount:</label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount"
              value={paid}
              onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
            />
          </div>
          
          {paid >= total && (
            <div className="flex justify-between mb-3 text-green-600">
              <span>Change:</span>
              <span className="font-bold">{formatRupiah(change)}</span>
            </div>
          )}
          
          <button
            onClick={handlePayment}
            className="btn-success w-full flex items-center justify-center gap-2 py-3"
            disabled={cart.length === 0}
          >
            <FaPrint /> Process Payment
          </button>
        </div>
      </div>
    </div>
  );
}