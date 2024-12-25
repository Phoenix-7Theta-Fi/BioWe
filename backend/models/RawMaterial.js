const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mineral', 'organic', 'chemical', 'biological']
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumRequired: {
    type: Number,
    required: true,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    leadTime: Number // in days
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  storageConditions: {
    temperature: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    },
    specialInstructions: String
  },
  usageHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    quantity: Number,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  }]
}, {
  timestamps: true
});

// Method to check if reorder is needed
rawMaterialSchema.methods.needsReorder = function() {
  return this.currentStock <= this.reorderPoint;
};

// Method to calculate days until reorder needed
rawMaterialSchema.methods.daysUntilReorder = function() {
  const dailyUsage = this.calculateAverageDailyUsage();
  if (dailyUsage === 0) return Infinity;
  return Math.floor((this.currentStock - this.reorderPoint) / dailyUsage);
};

// Calculate average daily usage over the last 30 days
rawMaterialSchema.methods.calculateAverageDailyUsage = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsage = this.usageHistory.filter(usage => 
    usage.date >= thirtyDaysAgo
  );

  const totalUsage = recentUsage.reduce((sum, usage) => sum + usage.quantity, 0);
  return totalUsage / 30;
};

// Method to use raw material
rawMaterialSchema.methods.use = async function(quantity, productId) {
  if (this.currentStock < quantity) {
    throw new Error('Insufficient stock');
  }

  this.currentStock -= quantity;
  this.usageHistory.push({
    date: new Date(),
    quantity,
    productId
  });

  return this.save();
};

// Method to restock
rawMaterialSchema.methods.restock = async function(quantity) {
  this.currentStock += quantity;
  this.lastRestocked = new Date();
  return this.save();
};

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
