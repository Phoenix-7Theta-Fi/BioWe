const mongoose = require('mongoose');
const RawMaterial = require('../models/RawMaterial');
require('dotenv').config();

const rawMaterials = [
  // Mineral-based Materials
  {
    name: 'Nitrogen Source',
    description: 'High-grade nitrogen compound for fertilizer production',
    category: 'chemical',
    unit: 'kg',
    currentStock: 1000,
    minimumRequired: 200,
    reorderPoint: 300,
    unitCost: 45.00,
    supplier: {
      name: 'ChemSupply Inc.',
      contact: '+1-555-0123',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 40, max: 60 },
      specialInstructions: 'Keep away from direct sunlight'
    }
  },
  {
    name: 'Phosphate Rock',
    description: 'Natural phosphate source',
    category: 'mineral',
    unit: 'kg',
    currentStock: 800,
    minimumRequired: 150,
    reorderPoint: 250,
    unitCost: 32.50,
    supplier: {
      name: 'MineralCo',
      contact: '+1-555-0124',
      leadTime: 7
    },
    storageConditions: {
      temperature: { min: 10, max: 35 },
      humidity: { min: 30, max: 70 }
    }
  },
  {
    name: 'Potassium Chloride',
    description: 'High-grade potassium source',
    category: 'mineral',
    unit: 'kg',
    currentStock: 900,
    minimumRequired: 180,
    reorderPoint: 270,
    unitCost: 38.75,
    supplier: {
      name: 'MineralCo',
      contact: '+1-555-0124',
      leadTime: 6
    },
    storageConditions: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 35, max: 65 }
    }
  },
  // Organic Materials
  {
    name: 'Composted Manure',
    description: 'Well-decomposed organic matter',
    category: 'organic',
    unit: 'kg',
    currentStock: 1500,
    minimumRequired: 300,
    reorderPoint: 450,
    unitCost: 12.00,
    supplier: {
      name: 'GreenOrganics',
      contact: '+1-555-0125',
      leadTime: 4
    },
    storageConditions: {
      temperature: { min: 5, max: 40 },
      humidity: { min: 40, max: 75 }
    }
  },
  {
    name: 'Bone Meal',
    description: 'Ground animal bones rich in phosphorus',
    category: 'organic',
    unit: 'kg',
    currentStock: 600,
    minimumRequired: 120,
    reorderPoint: 180,
    unitCost: 28.50,
    supplier: {
      name: 'OrganicSupplies',
      contact: '+1-555-0126',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 10, max: 30 },
      humidity: { min: 30, max: 60 }
    }
  },
  // Biological Materials
  {
    name: 'Beneficial Bacteria',
    description: 'Soil-enriching microorganisms',
    category: 'biological',
    unit: 'L',
    currentStock: 200,
    minimumRequired: 40,
    reorderPoint: 60,
    unitCost: 95.00,
    supplier: {
      name: 'BioTech Solutions',
      contact: '+1-555-0127',
      leadTime: 8
    },
    storageConditions: {
      temperature: { min: 2, max: 8 },
      humidity: { min: 45, max: 65 },
      specialInstructions: 'Keep refrigerated'
    }
  },
  {
    name: 'Mycorrhizal Fungi',
    description: 'Beneficial fungi for root development',
    category: 'biological',
    unit: 'kg',
    currentStock: 150,
    minimumRequired: 30,
    reorderPoint: 45,
    unitCost: 120.00,
    supplier: {
      name: 'BioTech Solutions',
      contact: '+1-555-0127',
      leadTime: 10
    },
    storageConditions: {
      temperature: { min: 4, max: 10 },
      humidity: { min: 50, max: 70 },
      specialInstructions: 'Keep refrigerated'
    }
  },
  // Chemical Materials
  {
    name: 'Urea',
    description: 'Concentrated nitrogen source',
    category: 'chemical',
    unit: 'kg',
    currentStock: 1200,
    minimumRequired: 240,
    reorderPoint: 360,
    unitCost: 35.00,
    supplier: {
      name: 'ChemSupply Inc.',
      contact: '+1-555-0123',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 40, max: 60 }
    }
  },
  {
    name: 'Sulfur',
    description: 'Essential nutrient and pH modifier',
    category: 'chemical',
    unit: 'kg',
    currentStock: 500,
    minimumRequired: 100,
    reorderPoint: 150,
    unitCost: 25.00,
    supplier: {
      name: 'ChemSupply Inc.',
      contact: '+1-555-0123',
      leadTime: 6
    },
    storageConditions: {
      temperature: { min: 10, max: 30 },
      humidity: { min: 30, max: 50 }
    }
  },
  {
    name: 'Iron Sulfate',
    description: 'Iron supplement for plant growth',
    category: 'chemical',
    unit: 'kg',
    currentStock: 400,
    minimumRequired: 80,
    reorderPoint: 120,
    unitCost: 42.00,
    supplier: {
      name: 'ChemSupply Inc.',
      contact: '+1-555-0123',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 35, max: 55 }
    }
  },
  // Additional Materials
  {
    name: 'Zinc Oxide',
    description: 'Micronutrient supplement',
    category: 'chemical',
    unit: 'kg',
    currentStock: 300,
    minimumRequired: 60,
    reorderPoint: 90,
    unitCost: 48.00,
    supplier: {
      name: 'ChemSupply Inc.',
      contact: '+1-555-0123',
      leadTime: 7
    },
    storageConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 35, max: 55 }
    }
  },
  {
    name: 'Magnesium Sulfate',
    description: 'Essential magnesium source',
    category: 'chemical',
    unit: 'kg',
    currentStock: 600,
    minimumRequired: 120,
    reorderPoint: 180,
    unitCost: 28.00,
    supplier: {
      name: 'ChemSupply Inc.',
      contact: '+1-555-0123',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 60 }
    }
  },
  {
    name: 'Seaweed Extract',
    description: 'Natural growth promoter',
    category: 'organic',
    unit: 'L',
    currentStock: 400,
    minimumRequired: 80,
    reorderPoint: 120,
    unitCost: 65.00,
    supplier: {
      name: 'OrganicSupplies',
      contact: '+1-555-0126',
      leadTime: 6
    },
    storageConditions: {
      temperature: { min: 10, max: 20 },
      humidity: { min: 45, max: 65 }
    }
  },
  {
    name: 'Humic Acid',
    description: 'Soil conditioner and nutrient enhancer',
    category: 'organic',
    unit: 'L',
    currentStock: 350,
    minimumRequired: 70,
    reorderPoint: 105,
    unitCost: 55.00,
    supplier: {
      name: 'OrganicSupplies',
      contact: '+1-555-0126',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 40, max: 60 }
    }
  },
  {
    name: 'Calcium Carbonate',
    description: 'pH adjuster and calcium source',
    category: 'mineral',
    unit: 'kg',
    currentStock: 800,
    minimumRequired: 160,
    reorderPoint: 240,
    unitCost: 18.00,
    supplier: {
      name: 'MineralCo',
      contact: '+1-555-0124',
      leadTime: 4
    },
    storageConditions: {
      temperature: { min: 10, max: 35 },
      humidity: { min: 30, max: 70 }
    }
  },
  {
    name: 'Amino Acids',
    description: 'Plant growth enhancer',
    category: 'biological',
    unit: 'L',
    currentStock: 250,
    minimumRequired: 50,
    reorderPoint: 75,
    unitCost: 88.00,
    supplier: {
      name: 'BioTech Solutions',
      contact: '+1-555-0127',
      leadTime: 7
    },
    storageConditions: {
      temperature: { min: 5, max: 15 },
      humidity: { min: 40, max: 60 },
      specialInstructions: 'Keep refrigerated'
    }
  },
  {
    name: 'Trace Elements Mix',
    description: 'Blend of essential micronutrients',
    category: 'chemical',
    unit: 'kg',
    currentStock: 300,
    minimumRequired: 60,
    reorderPoint: 90,
    unitCost: 75.00,
    supplier: {
      name: 'ChemSupply Inc.',
      contact: '+1-555-0123',
      leadTime: 8
    },
    storageConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 35, max: 55 }
    }
  },
  {
    name: 'Fulvic Acid',
    description: 'Natural chelating agent',
    category: 'organic',
    unit: 'L',
    currentStock: 300,
    minimumRequired: 60,
    reorderPoint: 90,
    unitCost: 62.00,
    supplier: {
      name: 'OrganicSupplies',
      contact: '+1-555-0126',
      leadTime: 6
    },
    storageConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 40, max: 60 }
    }
  },
  {
    name: 'Silicon Dioxide',
    description: 'Plant strength enhancer',
    category: 'mineral',
    unit: 'kg',
    currentStock: 400,
    minimumRequired: 80,
    reorderPoint: 120,
    unitCost: 35.00,
    supplier: {
      name: 'MineralCo',
      contact: '+1-555-0124',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 10, max: 30 },
      humidity: { min: 30, max: 60 }
    }
  },
  {
    name: 'Kelp Powder',
    description: 'Natural growth stimulant',
    category: 'organic',
    unit: 'kg',
    currentStock: 450,
    minimumRequired: 90,
    reorderPoint: 135,
    unitCost: 45.00,
    supplier: {
      name: 'OrganicSupplies',
      contact: '+1-555-0126',
      leadTime: 5
    },
    storageConditions: {
      temperature: { min: 10, max: 25 },
      humidity: { min: 40, max: 65 }
    }
  }
];

const seedRawMaterials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing raw materials
    await RawMaterial.deleteMany({});
    console.log('Cleared existing raw materials');

    // Insert new raw materials
    const result = await RawMaterial.insertMany(rawMaterials);
    console.log(`Seeded ${result.length} raw materials`);

    console.log('Raw materials seeding completed successfully');
  } catch (error) {
    console.error('Error seeding raw materials:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
seedRawMaterials();
