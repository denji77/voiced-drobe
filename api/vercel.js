import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// For Vercel, we need to handle file storage differently
// We'll use local storage for development and environment variables for production
let USERS = [];
let PRODUCTS = [];

// Initialize default data
const initializeData = () => {
  // In production, we would fetch this from a database
  // For now, we'll just use default data
  if (USERS.length === 0) {
    // Default admin, with password: smvit@is@gay@college!
    const hashedPassword = '$2a$10$vypvlmYCumuUil0DkVodjum3ATDc.9RlzIZCHiF5fE33jIjp73RhK';
    USERS = [{ id: 1, username: 'admin', password: hashedPassword, role: 'admin' }];
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Initialize data
initializeData();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Authentication routes
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login request received:', { username, passwordProvided: !!password });
  
  if (USERS.length === 0) {
    console.log('No users found in the database');
    return res.status(401).json({ message: 'User database is empty' });
  }
  
  const user = USERS.find(u => u.username === username);
  console.log('User found:', user ? { id: user.id, username: user.username, role: user.role } : 'None');
  
  if (!user) {
    console.log('User not found');
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  
  const passwordMatch = bcrypt.compareSync(password, user.password);
  console.log('Password match:', passwordMatch);
  
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  console.log('Login successful, token generated');

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Product routes
app.get('/products', (req, res) => {
  res.json(PRODUCTS);
});

app.get('/products/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// Admin product routes
app.post('/admin/products', authenticateToken, isAdmin, (req, res) => {
  const newProduct = req.body;
  
  // Ensure id doesn't already exist
  if (PRODUCTS.some(p => p.id === newProduct.id)) {
    return res.status(400).json({ message: 'Product with this ID already exists' });
  }
  
  PRODUCTS.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
  const id = req.params.id;
  const updatedProduct = req.body;
  
  const index = PRODUCTS.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  PRODUCTS[index] = { ...updatedProduct, id };
  res.json(PRODUCTS[index]);
});

app.delete('/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
  const id = req.params.id;
  
  const filteredProducts = PRODUCTS.filter(p => p.id !== id);
  
  if (filteredProducts.length === PRODUCTS.length) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  PRODUCTS = filteredProducts;
  res.json({ message: 'Product deleted successfully' });
});

export default app; 