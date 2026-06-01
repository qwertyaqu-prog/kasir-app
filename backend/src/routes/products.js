import express from 'express';
import { query, run } from '../database/init.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const products = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/barcode/:barcode', authenticate, async (req, res) => {
  try {
    const products = await query('SELECT * FROM products WHERE barcode = ?', [req.params.barcode]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { barcode, name, category_id, price, cost_price, stock, min_stock, unit } = req.body;
    const result = await run(
      'INSERT INTO products (barcode, name, category_id, price, cost_price, stock, min_stock, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [barcode, name, category_id, price, cost_price || 0, stock || 0, min_stock || 5, unit || 'pcs']
    );
    res.json({ id: result.id, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { barcode, name, category_id, price, cost_price, stock, min_stock, unit } = req.body;
    await run(
      'UPDATE products SET barcode=?, name=?, category_id=?, price=?, cost_price=?, stock=?, min_stock=?, unit=? WHERE id=?',
      [barcode, name, category_id, price, cost_price, stock, min_stock, unit, req.params.id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await run('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;