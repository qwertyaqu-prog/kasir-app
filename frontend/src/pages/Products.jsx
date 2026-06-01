import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { useAuthStore } from '../stores/authStore';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category_id: '',
    price: '',
    cost_price: '',
    stock: '',
    min_stock: 5,
    unit: 'pcs'
  });
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          cost_price: parseInt(formData.cost_price) || 0,
          stock: parseInt(formData.stock) || 0,
          min_stock: parseInt(formData.min_stock) || 5
        })
      });
      
      if (!response.ok) throw new Error('Failed to save product');
      
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ barcode: '', name: '', category_id: '', price: '', cost_price: '', stock: '', min_stock: 5, unit: 'pcs' });
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
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
  
  const isAdmin = user?.role === 'admin';
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Add Product
          </button>
        )}
      </div>
      
      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Barcode</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Price (Sell)</th>
                <th className="px-4 py-3 text-right">Cost (Modal)</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-center">Stock</th>
                {isAdmin && <th className="px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const profit = product.price - (product.cost_price || 0);
                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{product.barcode || '-'}</td>
                    <td className="px-4 py-2 font-medium">{product.name}</td>
                    <td className="px-4 py-2 text-sm">{product.category_name || '-'}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(product.price)}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{formatRupiah(product.cost_price || 0)}</td>
                    <td className="px-4 py-2 text-right text-green-600">{formatRupiah(profit)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${product.stock <= product.min_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setFormData({
                                barcode: product.barcode || '',
                                name: product.name,
                                category_id: product.category_id || '',
                                price: product.price,
                                cost_price: product.cost_price || 0,
                                stock: product.stock,
                                min_stock: product.min_stock,
                                unit: product.unit || 'pcs'
                              });
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found
          </div>
        )}
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm mb-1">Barcode</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Product Name *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Category</label>
                <select
                  className="input-field"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-sm mb-1">Selling Price *</label>
                  <input
                    type="number"
                    className="input-field"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Cost Price (Modal)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-sm mb-1">Stock</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Unit</label>
                <select
                  className="input-field"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="liter">Liter</option>
                  <option value="pack">Pack</option>
                  <option value="bungkus">Bungkus</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}