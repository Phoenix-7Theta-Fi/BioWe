const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  { 
    name: 'Premium Organic Fertilizer',
    price: 29.99,
    description: 'High-quality organic fertilizer for all types of plants',
    image: '🌱'
  },
  { 
    name: 'Bio-Compost Plus',
    price: 19.99,
    description: 'Nutrient-rich compost for soil enhancement',
    image: '🍂'
  },
  { 
    name: 'Growth Booster Pro',
    price: 39.99,
    description: 'Advanced formula for rapid plant growth',
    image: '🌿'
  },
  { 
    name: 'Soil pH Balancer',
    price: 24.99,
    description: 'Maintains optimal soil pH for healthy plants',
    image: '⚗️'
  },
  { 
    name: 'Root Strengthener',
    price: 34.99,
    description: 'Enhances root development and plant stability',
    image: '🌳'
  },
  { 
    name: 'Bloom Maximizer',
    price: 27.99,
    description: 'Promotes abundant flowering and fruiting',
    image: '🌸'
  },
  { 
    name: 'Natural Pest Shield',
    price: 32.99,
    description: 'Organic pest control solution',
    image: '🛡️'
  },
  { 
    name: 'Moisture Retention Mix',
    price: 21.99,
    description: 'Improves soil water retention',
    image: '💧'
  },
  { 
    name: 'Essential Micronutrients',
    price: 36.99,
    description: 'Complete blend of vital micronutrients',
    image: '🧪'
  },
  { 
    name: 'Winter Plant Protector',
    price: 28.99,
    description: 'Shields plants from cold weather damage',
    image: '❄️'
  }
];

const uri = "mongodb+srv://harsha:mesMD10ox5E3ZrTp@cluster0.0wtqn.mongodb.net/biowe?retryWrites=true&w=majority&appName=Cluster0";

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    // Log the seeded products
    console.log('\nSeeded Products:');
    insertedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.price})`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed script
seedProducts();
