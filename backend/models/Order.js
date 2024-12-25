const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update inventory when order status changes
orderSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    const Product = mongoose.model('Product');
    
    try {
      if (this.status === 'completed') {
        // Reduce inventory for completed orders
        for (const item of this.products) {
          const product = await Product.findById(item.productId);
          if (product) {
            await product.recordSale(item.quantity, item.price);
          }
        }
      } else if (this.status === 'cancelled' && this._previousStatus === 'completed') {
        // Restore inventory for cancelled orders that were previously completed
        for (const item of this.products) {
          const product = await Product.findById(item.productId);
          if (product) {
            await product.restock(item.quantity);
          }
        }
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }
  next();
});

// Store previous status for inventory management
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this._previousStatus = this.status;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
