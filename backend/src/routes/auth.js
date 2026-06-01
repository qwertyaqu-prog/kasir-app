import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../database/init.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kasir-pro-secret-key-2024';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const users = await query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullname: user.fullname },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.fullname
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await query('SELECT id, username, fullname, role FROM users WHERE id = ?', [decoded.id]);
    res.json(users[0]);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;