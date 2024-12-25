const mongoose = require('mongoose');
const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');
require('dotenv').config();

const createProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all raw materials
    const rawMaterials = await RawMaterial.find();
    const getMaterialId = (name) => {
      const material = rawMaterials.find(m => m.name === name);
      return material ? material._id : null;
    };

    const products = [
      {
        name: 'Premium NPK Fertilizer',
        description: 'Balanced NPK fertilizer for general purpose use',
        price: 299.99,
        category: 'fertilizer',
        imageUrl: 'https://example.com/npk-fertilizer.jpg',
        stockQuantity: 500,
        lowStockThreshold: 100,
        unit: 'kg',
        batchSize: 1000,
        productionTime: 4,
        rawMaterials: [
          { material: getMaterialId('Nitrogen Source'), quantityRequired: 200, unit: 'kg' },
          { material: getMaterialId('Phosphate Rock'), quantityRequired: 150, unit: 'kg' },
          { material: getMaterialId('Potassium Chloride'), quantityRequired: 150, unit: 'kg' },
          { material: getMaterialId('Trace Elements Mix'), quantityRequired: 50, unit: 'kg' }
        ]
      },
      {
        name: 'Organic Growth Booster',
        description: 'Natural plant growth enhancer with seaweed and humic acid',
        price: 159.99,
        category: 'growth-enhancer',
        imageUrl: 'https://example.com/growth-booster.jpg',
        stockQuantity: 300,
        lowStockThreshold: 60,
        unit: 'L',
        batchSize: 500,
        productionTime: 3,
        rawMaterials: [
          { material: getMaterialId('Seaweed Extract'), quantityRequired: 200, unit: 'L' },
          { material: getMaterialId('Humic Acid'), quantityRequired: 100, unit: 'L' },
          { material: getMaterialId('Amino Acids'), quantityRequired: 50, unit: 'L' },
          { material: getMaterialId('Fulvic Acid'), quantityRequired: 50, unit: 'L' }
        ]
      },
      {
        name: 'Bio-Enhanced Compost',
        description: 'Rich organic compost enriched with beneficial microorganisms',
        price: 129.99,
        category: 'compost',
        imageUrl: 'https://example.com/bio-compost.jpg',
        stockQuantity: 800,
        lowStockThreshold: 150,
        unit: 'kg',
        batchSize: 2000,
        productionTime: 6,
        rawMaterials: [
          { material: getMaterialId('Composted Manure'), quantityRequired: 1000, unit: 'kg' },
          { material: getMaterialId('Beneficial Bacteria'), quantityRequired: 20, unit: 'L' },
          { material: getMaterialId('Mycorrhizal Fungi'), quantityRequired: 10, unit: 'kg' },
          { material: getMaterialId('Humic Acid'), quantityRequired: 50, unit: 'L' }
        ]
      },
      {
        name: 'Power Bloom Formula',
        description: 'Specialized fertilizer for flowering and fruiting stages',
        price: 189.99,
        category: 'fertilizer',
        imageUrl: 'https://example.com/power-bloom.jpg',
        stockQuantity: 400,
        lowStockThreshold: 80,
        unit: 'kg',
        batchSize: 800,
        productionTime: 3,
        rawMaterials: [
          { material: getMaterialId('Phosphate Rock'), quantityRequired: 300, unit: 'kg' },
          { material: getMaterialId('Potassium Chloride'), quantityRequired: 200, unit: 'kg' },
          { material: getMaterialId('Calcium Carbonate'), quantityRequired: 100, unit: 'kg' },
          { material: getMaterialId('Trace Elements Mix'), quantityRequired: 30, unit: 'kg' }
        ]
      },
      {
        name: 'Soil pH Balancer',
        description: 'Professional-grade soil pH adjustment formula',
        price: 79.99,
        category: 'soil-treatment',
        imageUrl: 'https://example.com/ph-balancer.jpg',
        stockQuantity: 600,
        lowStockThreshold: 120,
        unit: 'kg',
        batchSize: 1000,
        productionTime: 2,
        rawMaterials: [
          { material: getMaterialId('Calcium Carbonate'), quantityRequired: 400, unit: 'kg' },
          { material: getMaterialId('Sulfur'), quantityRequired: 200, unit: 'kg' },
          { material: getMaterialId('Magnesium Sulfate'), quantityRequired: 100, unit: 'kg' }
        ]
      },
      {
        name: 'Root Development Plus',
        description: 'Specialized formula for strong root development',
        price: 219.99,
        category: 'growth-enhancer',
        imageUrl: 'https://example.com/root-plus.jpg',
        stockQuantity: 250,
        lowStockThreshold: 50,
        unit: 'L',
        batchSize: 500,
        productionTime: 4,
        rawMaterials: [
          { material: getMaterialId('Mycorrhizal Fungi'), quantityRequired: 50, unit: 'kg' },
          { material: getMaterialId('Humic Acid'), quantityRequired: 100, unit: 'L' },
          { material: getMaterialId('Seaweed Extract'), quantityRequired: 100, unit: 'L' },
          { material: getMaterialId('Amino Acids'), quantityRequired: 50, unit: 'L' }
        ]
      },
      {
        name: 'Micronutrient Boost',
        description: 'Complete micronutrient supplement for plants',
        price: 149.99,
        category: 'fertilizer',
        imageUrl: 'https://example.com/micro-boost.jpg',
        stockQuantity: 350,
        lowStockThreshold: 70,
        unit: 'kg',
        batchSize: 700,
        productionTime: 3,
        rawMaterials: [
          { material: getMaterialId('Iron Sulfate'), quantityRequired: 150, unit: 'kg' },
          { material: getMaterialId('Zinc Oxide'), quantityRequired: 100, unit: 'kg' },
          { material: getMaterialId('Trace Elements Mix'), quantityRequired: 200, unit: 'kg' },
          { material: getMaterialId('Magnesium Sulfate'), quantityRequired: 100, unit: 'kg' }
        ]
      },
      {
        name: 'Organic Matter Plus',
        description: 'Rich organic soil amendment',
        price: 89.99,
        category: 'soil-treatment',
        imageUrl: 'https://example.com/organic-plus.jpg',
        stockQuantity: 700,
        lowStockThreshold: 140,
        unit: 'kg',
        batchSize: 1500,
        productionTime: 5,
        rawMaterials: [
          { material: getMaterialId('Composted Manure'), quantityRequired: 800, unit: 'kg' },
          { material: getMaterialId('Bone Meal'), quantityRequired: 200, unit: 'kg' },
          { material: getMaterialId('Kelp Powder'), quantityRequired: 100, unit: 'kg' },
          { material: getMaterialId('Humic Acid'), quantityRequired: 50, unit: 'L' }
        ]
      },
      {
        name: 'Plant Defense Formula',
        description: 'Strengthens plants natural defense mechanisms',
        price: 169.99,
        category: 'protection',
        imageUrl: 'https://example.com/plant-defense.jpg',
        stockQuantity: 300,
        lowStockThreshold: 60,
        unit: 'L',
        batchSize: 600,
        productionTime: 4,
        rawMaterials: [
          { material: getMaterialId('Silicon Dioxide'), quantityRequired: 150, unit: 'kg' },
          { material: getMaterialId('Seaweed Extract'), quantityRequired: 100, unit: 'L' },
          { material: getMaterialId('Beneficial Bacteria'), quantityRequired: 50, unit: 'L' },
          { material: getMaterialId('Amino Acids'), quantityRequired: 50, unit: 'L' }
        ]
      },
      {
        name: 'Complete Crop Care',
        description: 'All-in-one crop nutrition and protection formula',
        price: 259.99,
        category: 'fertilizer',
        imageUrl: 'https://example.com/complete-care.jpg',
        stockQuantity: 400,
        lowStockThreshold: 80,
        unit: 'kg',
        batchSize: 1000,
        productionTime: 5,
        rawMaterials: [
          { material: getMaterialId('Nitrogen Source'), quantityRequired: 200, unit: 'kg' },
          { material: getMaterialId('Phosphate Rock'), quantityRequired: 150, unit: 'kg' },
          { material: getMaterialId('Potassium Chloride'), quantityRequired: 150, unit: 'kg' },
          { material: getMaterialId('Trace Elements Mix'), quantityRequired: 50, unit: 'kg' },
          { material: getMaterialId('Seaweed Extract'), quantityRequired: 50, unit: 'L' },
          { material: getMaterialId('Silicon Dioxide'), quantityRequired: 50, unit: 'kg' }
        ]
      }
    ];

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`Seeded ${result.length} products`);

    console.log('Product seeding completed successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
createProducts();
