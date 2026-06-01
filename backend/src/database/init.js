import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'kasir.sqlite');
export const db = new sqlite3.Database(dbPath);

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // ========== USERS TABLE ==========
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          fullname TEXT NOT NULL,
          role TEXT DEFAULT 'kasir',
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ========== CATEGORIES TABLE ==========
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ========== PRODUCTS TABLE (dengan cost_price) ==========
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          barcode TEXT UNIQUE,
          name TEXT NOT NULL,
          category_id INTEGER,
          price INTEGER NOT NULL,
          cost_price INTEGER DEFAULT 0,
          stock INTEGER DEFAULT 0,
          min_stock INTEGER DEFAULT 5,
          unit TEXT DEFAULT 'pcs',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);

      // ========== TRANSACTIONS TABLE ==========
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT UNIQUE NOT NULL,
          user_id INTEGER,
          customer_name TEXT DEFAULT 'Umum',
          subtotal INTEGER NOT NULL,
          discount INTEGER DEFAULT 0,
          tax INTEGER DEFAULT 0,
          total INTEGER NOT NULL,
          paid INTEGER NOT NULL,
          change INTEGER NOT NULL,
          payment_method TEXT DEFAULT 'cash',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // ========== TRANSACTION ITEMS TABLE ==========
      db.run(`
        CREATE TABLE IF NOT EXISTS transaction_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_id INTEGER,
          product_id INTEGER,
          quantity INTEGER NOT NULL,
          price INTEGER NOT NULL,
          cost_price INTEGER NOT NULL,
          subtotal INTEGER NOT NULL,
          FOREIGN KEY (transaction_id) REFERENCES transactions(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

      // ========== INSERT DEFAULT CATEGORIES ==========
      const defaultCategories = [
        'Makanan', 'Minuman', 'Rokok', 'Snack', 'Sembako', 'Lainnya'
      ];
      defaultCategories.forEach(cat => {
        db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [cat]);
      });

      // ========== INSERT DEFAULT ADMIN ==========
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, password, fullname, role) 
        VALUES (?, ?, ?, ?)
      `, ['admin', hashedPassword, 'Administrator', 'admin']);

      // ========== INSERT DEFAULT KASIR ==========
      db.run(`
        INSERT OR IGNORE INTO users (username, password, fullname, role) 
        VALUES (?, ?, ?, ?)
      `, ['kasir1', bcrypt.hashSync('kasir123', 10), 'Kasir Satu', 'kasir']);

      // ========== INSERT SAMPLE PRODUCTS (dengan cost_price) ==========
      const sampleProducts = [
        ['8991001234567', 'Indomie Goreng', 1, 3500, 2800, 50, 5, 'pcs'],
        ['8991001234568', 'Aqua 600ml', 2, 3000, 2200, 40, 5, 'botol'],
        ['8991001234569', 'Rokok Surya 16', 3, 22500, 19500, 30, 10, 'bungkus'],
        ['8991001234570', 'Chitato', 4, 12000, 9500, 25, 5, 'pcs'],
        ['8991001234571', 'Teh Pucuk', 2, 4500, 3500, 35, 5, 'botol'],
        ['8991001234572', 'Gula Pasir 1kg', 5, 15000, 13000, 20, 5, 'kg'],
        ['8991001234573', 'Minyak Goreng 1L', 5, 18000, 15500, 15, 5, 'liter'],
      ];

      sampleProducts.forEach(p => {
        db.run(`
          INSERT OR IGNORE INTO products (barcode, name, category_id, price, cost_price, stock, min_stock, unit) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, p);
      });

      console.log('✅ Database initialized successfully');
      console.log('📋 Tables: users, categories, products, transactions, transaction_items');
      
      resolve();
    });
  });
}

export function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}