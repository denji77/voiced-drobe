
import { v4 as uuidv4 } from 'uuid';

// Define types for our products
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
  rating: number;
}

// Product categories with corresponding image URLs
const categories = [
  { name: 'T-Shirts', images: [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000'
  ]},
  { name: 'Jackets', images: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000',
    'https://images.unsplash.com/photo-1548126032-079a0fb0099d?q=80&w=1000',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000'
  ]},
  { name: 'Pants', images: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000'
  ]},
  { name: 'Dresses', images: [
    'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1000',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000'
  ]},
  { name: 'Shoes', images: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=1000',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000'
  ]}
];

// T-Shirt name parts
const tshirtPrefixes = ['Casual', 'Classic', 'Modern', 'Essential', 'Urban', 'Comfort', 'Slim-fit', 'Basic'];
const tshirtTypes = ['Crew Neck', 'V-Neck', 'Henley', 'Graphic', 'Striped', 'Solid', 'Pocket', 'Long Sleeve'];

// Jacket name parts
const jacketPrefixes = ['Winter', 'Autumn', 'Spring', 'Stylish', 'Classic', 'Modern', 'Vintage', 'Urban'];
const jacketTypes = ['Bomber', 'Leather', 'Denim', 'Puffer', 'Windbreaker', 'Trench Coat', 'Parka', 'Blazer'];

// Pants name parts
const pantsPrefixes = ['Casual', 'Relaxed', 'Slim', 'Modern', 'Classic', 'Stretch', 'Athletic', 'Urban'];
const pantsTypes = ['Jeans', 'Chinos', 'Trousers', 'Joggers', 'Cargo', 'Khakis', 'Sweatpants', 'Dress Pants'];

// Dresses name parts
const dressPrefixes = ['Elegant', 'Summer', 'Casual', 'Chic', 'Floral', 'Evening', 'Modern', 'Vintage'];
const dressTypes = ['Maxi', 'Mini', 'Midi', 'Wrap', 'Shift', 'A-Line', 'Bodycon', 'Slip'];

// Shoes name parts
const shoesPrefixes = ['Classic', 'Casual', 'Stylish', 'Comfort', 'Sport', 'Modern', 'Urban', 'Premium'];
const shoesTypes = ['Sneakers', 'Loafers', 'Boots', 'Sandals', 'Running Shoes', 'Oxfords', 'Slip-ons', 'Athletic'];

// Product description templates
const descriptions = {
  'T-Shirts': [
    "Made from premium cotton for breathability and comfort. Perfect for casual outings or layering under jackets.",
    "Soft, breathable fabric that feels great against your skin. Features a classic design that pairs with anything.",
    "A wardrobe essential with a modern fit. Made with high-quality materials for durability and comfort."
  ],
  'Jackets': [
    "Designed to keep you warm and stylish. Features a durable outer shell and comfortable lining.",
    "Weather-resistant and fashionable, this jacket provides protection while elevating your style.",
    "The perfect balance of function and fashion. Keeps you comfortable in changing conditions."
  ],
  'Pants': [
    "Designed for comfort and style, these pants feature a modern fit and durable construction.",
    "Versatile design that transitions seamlessly from casual to semi-formal occasions.",
    "Made with quality fabric that maintains its shape. Features practical pockets and a comfortable waistband."
  ],
  'Dresses': [
    "Elegantly designed to flatter your figure. Made with flowing fabric for comfort and movement.",
    "A versatile piece that can be dressed up or down. Features a timeless design and comfortable fit.",
    "Crafted from quality materials with attention to detail. Perfect for special occasions or everyday wear."
  ],
  'Shoes': [
    "Engineered for comfort without compromising style. Features cushioned insoles and durable outsoles.",
    "Combines classic design with modern comfort technology. Perfect for all-day wear.",
    "Handcrafted with attention to detail. Designed to provide support while elevating your outfit."
  ]
};

// Generate a product name based on category
function generateName(category: string): string {
  let prefix, type;
  
  switch(category) {
    case 'T-Shirts':
      prefix = tshirtPrefixes[Math.floor(Math.random() * tshirtPrefixes.length)];
      type = tshirtTypes[Math.floor(Math.random() * tshirtTypes.length)];
      break;
    case 'Jackets':
      prefix = jacketPrefixes[Math.floor(Math.random() * jacketPrefixes.length)];
      type = jacketTypes[Math.floor(Math.random() * jacketTypes.length)];
      break;
    case 'Pants':
      prefix = pantsPrefixes[Math.floor(Math.random() * pantsPrefixes.length)];
      type = pantsTypes[Math.floor(Math.random() * pantsTypes.length)];
      break;
    case 'Dresses':
      prefix = dressPrefixes[Math.floor(Math.random() * dressPrefixes.length)];
      type = dressTypes[Math.floor(Math.random() * dressTypes.length)];
      break;
    case 'Shoes':
      prefix = shoesPrefixes[Math.floor(Math.random() * shoesPrefixes.length)];
      type = shoesTypes[Math.floor(Math.random() * shoesTypes.length)];
      break;
    default:
      prefix = 'Classic';
      type = 'Item';
  }
  
  return `${prefix} ${type}`;
}

// Generate a random price between min and max
function generatePrice(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Generate available sizes based on category
function generateSizes(category: string): string[] {
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const shoeSizes = ['6', '7', '8', '9', '10', '11', '12'];
  
  // Randomly select a number of sizes (at least 3)
  const numSizes = Math.floor(Math.random() * 4) + 3;
  
  if (category === 'Shoes') {
    return shoeSizes.sort(() => 0.5 - Math.random()).slice(0, numSizes);
  } else {
    return allSizes.sort(() => 0.5 - Math.random()).slice(0, numSizes);
  }
}

// Generate a single random product
export function generateProduct(): Product {
  const categoryObj = categories[Math.floor(Math.random() * categories.length)];
  const category = categoryObj.name;
  const images = categoryObj.images;
  const imageUrl = images[Math.floor(Math.random() * images.length)];
  
  return {
    id: uuidv4(),
    name: generateName(category),
    description: descriptions[category as keyof typeof descriptions][
      Math.floor(Math.random() * descriptions[category as keyof typeof descriptions].length)
    ],
    price: generatePrice(19.99, 199.99),
    category,
    imageUrl,
    sizes: generateSizes(category),
    inStock: Math.random() > 0.2, // 80% chance of being in stock
    rating: parseFloat((Math.random() * 3 + 2).toFixed(1)) // Rating between 2.0 and 5.0
  };
}

// Generate multiple products
export function generateProducts(count: number): Product[] {
  return Array(count).fill(null).map(() => generateProduct());
}

// Function to get stored products or generate new ones
export function getProducts(count: number = 16): Product[] {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    return JSON.parse(storedProducts);
  }
  
  const newProducts = generateProducts(count);
  localStorage.setItem('products', JSON.stringify(newProducts));
  return newProducts;
}

// Get a product by ID
export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(product => product.id === id);
}
