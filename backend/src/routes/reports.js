import express from 'express';
import { query } from '../database/init.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Dashboard Summary
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's sales
    const todaySales = await query(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count 
      FROM transactions 
      WHERE DATE(created_at) = ?
    `, [today]);
    
    // Total products
    const totalProducts = await query('SELECT COUNT(*) as count FROM products');
    
    // Low stock
    const lowStock = await query('SELECT COUNT(*) as count FROM products WHERE stock <= min_stock');
    
    // Monthly sales trend
    const monthlyTrend = await query(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(total) as total_sales
      FROM transactions
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
    `);
    
    res.json({
      today: {
        sales: todaySales[0]?.total || 0,
        transactions: todaySales[0]?.count || 0
      },
      products: {
        total: totalProducts[0]?.count || 0,
        low_stock: lowStock[0]?.count || 0
      },
      monthly_trend: monthlyTrend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily Sales Report
router.get('/daily', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const report = await query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total) as total_sales,
        AVG(total) as average_transaction,
        SUM(paid) as total_paid,
        SUM(change) as total_change
      FROM transactions
      WHERE DATE(created_at) = ?
    `, [targetDate]);
    
    const topProducts = await query(`
      SELECT p.name, SUM(ti.quantity) as total_sold, SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE DATE(t.created_at) = ?
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `, [targetDate]);
    
    res.json({
      date: targetDate,
      summary: report[0] || { total_transactions: 0, total_sales: 0, average_transaction: 0, total_paid: 0, total_change: 0 },
      top_products: topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PROFIT & LOSS REPORT (LENGKAP) ==========
router.get('/profit-loss', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(t.created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    // Summary Profit/Loss
    const summary = await query(`
      SELECT 
        COALESCE(SUM(ti.subtotal), 0) as total_sales,
        COALESCE(SUM(ti.quantity * ti.cost_price), 0) as total_cost,
        COALESCE(SUM(ti.subtotal - (ti.quantity * ti.cost_price)), 0) as total_profit,
        COUNT(DISTINCT t.id) as total_transactions,
        ROUND(100.0 * SUM(ti.subtotal - (ti.quantity * ti.cost_price)) / NULLIF(SUM(ti.subtotal), 0), 2) as profit_margin
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE 1=1 ${dateFilter}
    `, params);
    
    // Profit per product
    const productProfit = await query(`
      SELECT 
        p.name,
        p.barcode,
        SUM(ti.quantity) as quantity_sold,
        SUM(ti.subtotal) as total_sales,
        SUM(ti.quantity * ti.cost_price) as total_cost,
        SUM(ti.subtotal - (ti.quantity * ti.cost_price)) as profit,
        ROUND(100.0 * SUM(ti.subtotal - (ti.quantity * ti.cost_price)) / NULLIF(SUM(ti.subtotal), 0), 2) as margin
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE 1=1 ${dateFilter}
      GROUP BY p.id
      ORDER BY profit DESC
      LIMIT 20
    `, params);
    
    // Daily breakdown
    const dailyBreakdown = await query(`
      SELECT 
        DATE(t.created_at) as date,
        COUNT(DISTINCT t.id) as transactions,
        SUM(ti.subtotal) as sales,
        SUM(ti.quantity * ti.cost_price) as cost,
        SUM(ti.subtotal - (ti.quantity * ti.cost_price)) as profit
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(t.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params);
    
    // Inventory value
    const inventory = await query(`
      SELECT 
        SUM(price * stock) as selling_value,
        SUM(cost_price * stock) as cost_value,
        SUM((price - cost_price) * stock) as potential_profit
      FROM products
    `);
    
    res.json({
      period: { start_date, end_date },
      summary: summary[0],
      product_profit: productProfit,
      daily_breakdown: dailyBreakdown,
      inventory: {
        selling_value: inventory[0]?.selling_value || 0,
        cost_value: inventory[0]?.cost_value || 0,
        potential_profit: inventory[0]?.potential_profit || 0
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock Report
router.get('/stock', authenticate, authorize('admin'), async (req, res) => {
  try {
    const lowStock = await query(`
      SELECT * FROM products 
      WHERE stock <= min_stock 
      ORDER BY stock ASC
    `);
    
    const totalValue = await query(`
      SELECT 
        SUM(price * stock) as selling_value,
        SUM(cost_price * stock) as cost_value
      FROM products
    `);
    
    res.json({
      low_stock: lowStock,
      total_selling_value: totalValue[0]?.selling_value || 0,
      total_cost_value: totalValue[0]?.cost_value || 0,
      total_products: lowStock.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;