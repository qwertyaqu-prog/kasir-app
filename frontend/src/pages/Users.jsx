import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaKey, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { useAuthStore } from '../stores/authStore';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    role: 'kasir'
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: ''
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save user');
      
      toast.success(editingUser ? 'User updated' : 'User created');
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', fullname: '', role: 'kasir' });
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const handleResetPassword = async () => {
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: passwordData.newPassword })
      });
      
      if (!response.ok) throw new Error('Failed to reset password');
      
      toast.success(`Password for ${selectedUser.username} has been reset`);
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const handleToggleStatus = async (user) => {
    const newStatus = user.is_active ? 0 : 1;
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...user, is_active: newStatus })
      });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add User
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Full Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{u.username}</td>
                  <td className="px-4 py-2">{u.fullname}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {u.is_active ? (
                      <span className="text-green-600 flex items-center justify-center gap-1">
                        <FaUserCheck /> Active
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center justify-center gap-1">
                        <FaUserTimes /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setFormData({
                            username: u.username,
                            fullname: u.fullname,
                            role: u.role,
                            password: ''
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowPasswordModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Reset Password"
                      >
                        <FaKey />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={u.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                        title={u.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {u.is_active ? <FaUserTimes /> : <FaUserCheck />}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm mb-1">Username *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>
              {!editingUser && (
                <div className="mb-3">
                  <label className="block text-sm mb-1">Password *</label>
                  <input
                    type="password"
                    className="input-field"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="block text-sm mb-1">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Role</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
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
      
      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reset Password for {selectedUser?.username}</h2>
            <div className="mb-3">
              <label className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ newPassword: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Default: kasir123</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ newPassword: '' });
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button onClick={handleResetPassword} className="btn-primary">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}