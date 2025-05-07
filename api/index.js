import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const isVercel = process.env.VERCEL === '1';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

//Middleware
app.use(cors());
app.use(express.json());

//Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    console.log('Login attempt with:', { username: req.body.username });
  }
  next();
});

//Data storage paths
const PRODUCTS_PATH = join(__dirname, 'data', 'products.json');
const USERS_PATH = join(__dirname, 'data', 'users.json');

console.log('Data directory:', join(__dirname, 'data'));
console.log('Users file path:', USERS_PATH);

//For Vercel, we'll use in-memory storage instead of file system
//This is because Vercel Functions are read-only filesystem
let USERS_MEMORY = [];
let PRODUCTS_MEMORY = [];

//Initialize data stores
const initializeData = () => {
  if (isVercel) {
    // In Vercel, use in-memory storage
    if (USERS_MEMORY.length === 0) {
      const hashedPassword = '$2a$12$EvHF5Oaxrl.3cjksU3GHp.yngbAgDO75Zs7GnjzRnsMX5nTmBn1na';
      USERS_MEMORY = [{ id: 1, username: 'admin', password: hashedPassword, role: 'admin' }];
    }
    
    // Initialize default products for Vercel
    if (PRODUCTS_MEMORY.length === 0) {
      PRODUCTS_MEMORY = [
        {
          id: "1",
          title: "Summer Dress",
          description: "A beautiful floral summer dress",
          price: 49.99,
          category: "Dresses",
          image: "https://example.com/summer-dress.jpg"
        },
        {
          id: "2",
          title: "Winter Coat",
          description: "Warm and stylish winter coat",
          price: 129.99,
          category: "Outerwear",
          image: "https://example.com/winter-coat.jpg"
        },
        {
          id: "3",
          title: "Casual Jeans",
          description: "Classic blue denim jeans",
          price: 59.99,
          category: "Pants",
          image: "https://example.com/jeans.jpg"
        }
      ];
    }
  } else {
    // In local development, use file system
    // Create data directory if it doesn't exist
    if (!fs.existsSync(join(__dirname, 'data'))) {
      console.log('Creating data directory...');
      fs.mkdirSync(join(__dirname, 'data'), { recursive: true });
    }

    //Initialize empty products.json if it doesn't exist
    if (!fs.existsSync(PRODUCTS_PATH)) {
      console.log('Creating empty products file...');
      fs.writeFileSync(PRODUCTS_PATH, JSON.stringify([]));
    }

    //Initialize users.json with default admin if it doesn't exist
    if (!fs.existsSync(USERS_PATH)) {
      console.log('Creating users file with default admin account...');
      //Default admin: username: admin, password hash for 'password'
      const hashedPassword = '$2a$12$EvHF5Oaxrl.3cjksU3GHp.yngbAgDO75Zs7GnjzRnsMX5nTmBn1na';
      fs.writeFileSync(
        USERS_PATH,
        JSON.stringify([{ id: 1, username: 'admin', password: hashedPassword, role: 'admin' }])
      );
    }
  }
};

//Helper functions for data access
const readProducts = () => {
  if (isVercel) {
    return PRODUCTS_MEMORY;
  } else {
    try {
      const data = fs.readFileSync(PRODUCTS_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading products:', error);
      return [];
    }
  }
};

const writeProducts = (products) => {
  if (isVercel) {
    PRODUCTS_MEMORY = products;
    return true;
  } else {
    try {
      fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing products:', error);
      return false;
    }
  }
};

const readUsers = () => {
  if (isVercel) {
    return USERS_MEMORY;
  } else {
    try {
      const data = fs.readFileSync(USERS_PATH, 'utf8');
      const users = JSON.parse(data);
      console.log('Users found:', users.map(u => ({ id: u.id, username: u.username, role: u.role })));
      return users;
    } catch (error) {
      console.error('Error reading users:', error);
      return [];
    }
  }
};

//Initialize data stores
initializeData();

//Authentication middleware
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

//Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

//Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

//Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login request received:', { username, passwordProvided: !!password });
  
  const users = readUsers();
  if (users.length === 0) {
    console.log('No users found in the database');
    return res.status(401).json({ message: 'User database is empty' });
  }
  
  const user = users.find(u => u.username === username);
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
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// Admin product routes
app.post('/api/admin/products', authenticateToken, isAdmin, (req, res) => {
  const products = readProducts();
  const newProduct = req.body;
  
  // Ensure id doesn't already exist
  if (products.some(p => p.id === newProduct.id)) {
    return res.status(400).json({ message: 'Product with this ID already exists' });
  }
  
  products.push(newProduct);
  
  if (writeProducts(products)) {
    res.status(201).json(newProduct);
  } else {
    res.status(500).json({ message: 'Failed to save product' });
  }
});

app.put('/api/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
  const products = readProducts();
  const id = req.params.id;
  const updatedProduct = req.body;
  
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products[index] = { ...updatedProduct, id };
  
  if (writeProducts(products)) {
    res.json(products[index]);
  } else {
    res.status(500).json({ message: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
  const products = readProducts();
  const id = req.params.id;
  
  const filteredProducts = products.filter(p => p.id !== id);
  
  if (filteredProducts.length === products.length) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  if (writeProducts(filteredProducts)) {
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

//For local development, start the server
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API is available at http://localhost:${PORT}/api`);
  });
}

//For Vercel, export the Express app
export default app; 