const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  category: {
    type: String,
    required: true,
    enum: ['fertilizer', 'compost', 'growth-enhancer', 'soil-treatment', 'protection']
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  rawMaterials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: true
    },
    quantityRequired: {
      type: Number,
      required: true,
      min: 0
    },
    unit: String
  }],
  productionTime: {
    type: Number, // in hours
    required: true,
    default: 1
  },
  batchSize: {
    type: Number,
    required: true,
    default: 100
  },
  salesHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }]
});

// Method to check if we can produce a certain quantity
productSchema.methods.canProduce = async function(quantity) {
  const RawMaterial = mongoose.model('RawMaterial');
  
  for (const material of this.rawMaterials) {
    const rawMaterial = await RawMaterial.findById(material.material);
    if (!rawMaterial) return false;
    
    const requiredQuantity = (quantity * material.quantityRequired) / this.batchSize;
    if (rawMaterial.currentStock < requiredQuantity) {
      return false;
    }
  }
  return true;
};

// Method to calculate production cost
productSchema.methods.calculateProductionCost = async function() {
  const RawMaterial = mongoose.model('RawMaterial');
  let totalCost = 0;
  
  for (const material of this.rawMaterials) {
    const rawMaterial = await RawMaterial.findById(material.material);
    if (rawMaterial) {
      totalCost += (material.quantityRequired * rawMaterial.unitCost) / this.batchSize;
    }
  }
  
  return totalCost;
};

// Method to record a sale
productSchema.methods.recordSale = async function(quantity, price) {
  if (this.stockQuantity < quantity) {
    throw new Error('Insufficient stock');
  }

  // Deduct raw materials
  const RawMaterial = mongoose.model('RawMaterial');
  for (const material of this.rawMaterials) {
    const rawMaterial = await RawMaterial.findById(material.material);
    if (rawMaterial) {
      await rawMaterial.use(
        (quantity * material.quantityRequired) / this.batchSize,
        this._id
      );
    }
  }

  this.stockQuantity -= quantity;
  this.salesHistory.push({
    date: new Date(),
    quantity,
    price
  });

  return this.save();
};

// Method to restock
productSchema.methods.restock = async function(quantity) {
  // Check if we have enough raw materials
  if (!(await this.canProduce(quantity))) {
    throw new Error('Insufficient raw materials for production');
  }

  // Use raw materials
  const RawMaterial = mongoose.model('RawMaterial');
  for (const material of this.rawMaterials) {
    const rawMaterial = await RawMaterial.findById(material.material);
    if (rawMaterial) {
      await rawMaterial.use(
        (quantity * material.quantityRequired) / this.batchSize,
        this._id
      );
    }
  }

  this.stockQuantity += quantity;
  this.lastRestocked = new Date();
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
