import express from 'express';
import bcrypt from 'bcryptjs';
import { query, run } from '../database/init.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await query('SELECT id, username, fullname, role, is_active, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, password, fullname, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result = await run(
      'INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, fullname, role || 'kasir']
    );
    
    res.json({ id: result.id, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { fullname, role, is_active } = req.body;
    await run('UPDATE users SET fullname = ?, role = ?, is_active = ? WHERE id = ?', 
      [fullname, role, is_active, req.params.id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.put('/:id/reset-password', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await run('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;