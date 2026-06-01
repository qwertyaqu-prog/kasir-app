import express from 'express';
import { query, run } from '../database/init.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV/${year}${month}${day}/${random}`;
}

router.post('/', authenticate, async (req, res) => {
  try {
    const { items, paid, payment_method, customer_name, discount, notes } = req.body;
    const user_id = req.user.id;
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discount || 0;
    const tax = 0;
    const total = subtotal - discountAmount + tax;
    const change = paid - total;
    
    if (change < 0) {
      return res.status(400).json({ error: 'Payment insufficient' });
    }
    
    const invoice_number = generateInvoiceNumber();
    
    const transaction = await run(
      `INSERT INTO transactions 
       (invoice_number, user_id, customer_name, subtotal, discount, tax, total, paid, change, payment_method, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, user_id, customer_name || 'Umum', subtotal, discountAmount, tax, total, paid, change, payment_method || 'cash', notes]
    );
    
    for (const item of items) {
      await run(
        `INSERT INTO transaction_items (transaction_id, product_id, quantity, price, cost_price, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [transaction.id, item.product_id, item.quantity, item.price, item.cost_price || 0, item.price * item.quantity]
      );
      
      await run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }
    
    res.json({
      invoice_number,
      subtotal,
      discount: discountAmount,
      total,
      paid,
      change,
      items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { start_date, end_date, limit = 100 } = req.query;
    let queryStr = `
      SELECT t.*, u.username 
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (start_date) {
      queryStr += ' AND DATE(t.created_at) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      queryStr += ' AND DATE(t.created_at) <= ?';
      params.push(end_date);
    }
    
    queryStr += ` ORDER BY t.created_at DESC LIMIT ${parseInt(limit)}`;
    
    const transactions = await query(queryStr, params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    if (transaction.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const items = await query(`
      SELECT ti.*, p.name, p.barcode 
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = ?
    `, [req.params.id]);
    
    res.json({ ...transaction[0], items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;