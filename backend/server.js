const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
const Order = require('./models/Order');
const RawMaterial = require('./models/RawMaterial');
const Customer = require('./models/Customer'); 
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5202;

// Log environment variables (without sensitive data)
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));

// Establish MongoDB connection before starting server
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const products = await Product.find()
      .populate({
        path: 'rawMaterials.material',
        select: 'name unitCost'
      })
      .exec();

    const productsWithDetails = products.map(product => {
      // Calculate production cost from raw materials
      const productionCost = product.rawMaterials.reduce((total, rm) => {
        const materialCost = rm.material ? (rm.material.unitCost || 0) : 0;
        const quantity = rm.quantityRequired || 0;
        return total + (materialCost * quantity);
      }, 0);

      // Add 20% overhead cost
      const totalCost = productionCost * 1.2;

      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl || '/default-product.png',
        stockQuantity: product.stockQuantity || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        unit: product.unit || 'kg',
        price: product.price || 0,
        cost: parseFloat(totalCost.toFixed(2)) || 0,
        lastRestocked: product.lastRestocked || new Date(),
        status: product.stockQuantity === 0 ? 'Out of Stock' :
                product.stockQuantity <= product.lowStockThreshold ? 'Low Stock' : 'In Stock',
        availableStock: product.stockQuantity || 0,
        reorderPoint: product.lowStockThreshold || 10
      };
    });
    
    res.json(productsWithDetails);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});

// Inventory statistics
app.get('/api/inventory/stats', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const products = await Product.find();
    
    const stats = {
      totalProducts: products.length,
      lowStockItems: products.filter(p => p.stockQuantity <= p.lowStockThreshold).length,
      outOfStock: products.filter(p => p.stockQuantity === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching inventory statistics' });
  }
});

// Sales data for charts
app.get('/api/inventory/sales', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const products = await Product.find();
    const salesData = products.map(product => ({
      name: product.name,
      unitsSold: product.salesHistory
        .filter(sale => new Date(sale.date) >= thirtyDaysAgo)
        .reduce((sum, sale) => sum + sale.quantity, 0),
      revenue: product.salesHistory
        .filter(sale => new Date(sale.date) >= thirtyDaysAgo)
        .reduce((sum, sale) => sum + (sale.price * sale.quantity), 0)
    }));
    
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sales data' });
  }
});

// Restock product
app.post('/api/products/:id/restock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity provided' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if we have enough raw materials
    const canProduce = await product.canProduce(quantity);
    if (!canProduce) {
      return res.status(400).json({ error: 'Insufficient raw materials for production' });
    }

    // Update stock quantity
    product.stockQuantity += Number(quantity);
    product.lastRestocked = new Date();
    
    // Use raw materials
    for (const rm of product.rawMaterials) {
      const rawMaterial = await RawMaterial.findById(rm.material);
      if (rawMaterial) {
        const requiredQuantity = (quantity * rm.quantityRequired) / product.batchSize;
        await rawMaterial.use(requiredQuantity, product._id);
      }
    }

    await product.save();
    
    res.json({
      message: 'Product restocked successfully',
      newQuantity: product.stockQuantity,
      lastRestocked: product.lastRestocked
    });
  } catch (error) {
    console.error('Error restocking product:', error);
    res.status(500).json({ error: 'Failed to restock product', details: error.message });
  }
});

// Update product details
app.put('/api/products/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

// Helper function to calculate and deduct raw materials
const deductRawMaterials = async (product, quantity) => {
  for (const material of product.rawMaterials) {
    const rawMaterial = await RawMaterial.findById(material.material);
    if (!rawMaterial) {
      throw new Error(`Raw material ${material.material} not found`);
    }

    const requiredQuantity = (quantity * material.quantityRequired) / product.batchSize;
    if (rawMaterial.currentStock < requiredQuantity) {
      throw new Error(`Insufficient stock of ${rawMaterial.name}`);
    }

    // Deduct the raw material and record usage
    await rawMaterial.use(requiredQuantity, product._id);
  }
};

// Helper function to check raw material availability
const checkRawMaterialAvailability = async (product, quantity) => {
  const insufficientMaterials = [];
  
  for (const material of product.rawMaterials) {
    const rawMaterial = await RawMaterial.findById(material.material);
    if (!rawMaterial) {
      insufficientMaterials.push(`Raw material not found: ${material.material}`);
      continue;
    }

    const requiredQuantity = (quantity * material.quantityRequired) / product.batchSize;
    if (rawMaterial.currentStock < requiredQuantity) {
      insufficientMaterials.push(
        `Insufficient ${rawMaterial.name}: needs ${requiredQuantity}${rawMaterial.unit}, has ${rawMaterial.currentStock}${rawMaterial.unit}`
      );
    }
  }

  return insufficientMaterials;
};

// Customer routes
app.get('/api/customers', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    console.log('Fetching customers...');
    const customers = await Customer.find().lean();
    console.log(`Found ${customers.length} customers`);
    res.json(customers);
  } catch (error) {
    console.error('Error in /api/customers:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers/:id/interactions', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const interaction = {
      date: new Date(),
      type: req.body.type,
      summary: req.body.summary,
      outcome: req.body.outcome,
      nextFollowUp: new Date(req.body.nextFollowUp),
      representative: req.body.representative
    };

    await customer.addInteraction(interaction);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error adding interaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order routes
app.post('/api/orders', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const { customerName, products } = req.body;

    // Validate order contents
    if (!customerName || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Find or create customer
    let customer = await Customer.findOne({ name: customerName });
    if (!customer) {
      customer = new Customer({ name: customerName });
      await customer.save();
    }

    // Check product availability and raw materials
    const orderProducts = [];
    const rawMaterialChecks = [];

    for (const item of products) {
      const product = await Product.findById(item.productId).populate('rawMaterials.material');
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` 
        });
      }

      // Check raw material availability
      const insufficientMaterials = await checkRawMaterialAvailability(product, item.quantity);
      if (insufficientMaterials.length > 0) {
        return res.status(400).json({
          error: 'Insufficient raw materials',
          details: insufficientMaterials
        });
      }

      orderProducts.push({ product, quantity: item.quantity });
    }

    // Calculate order total
    const orderTotal = orderProducts.reduce((total, { product, quantity }) => {
      return total + (product.price * quantity);
    }, 0);

    // Create order
    const order = new Order({
      customerName,
      products: products.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        priceAtOrder: orderProducts.find(p => p.product._id.toString() === item.productId).product.price
      })),
      status: 'pending',
      orderDate: new Date()
    });

    // Save order
    await order.save();

    // Update product stock and deduct raw materials
    for (const { product, quantity } of orderProducts) {
      // Deduct raw materials
      await deductRawMaterials(product, quantity);

      // Update product stock
      product.stockQuantity -= quantity;
      await product.save();
    }

    // Update customer metrics
    await customer.updateMetricsAfterOrder(orderTotal);

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order status' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Error deleting order' });
  }
});

app.get('/api/inventory/pending-impact', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const pendingOrders = await Order.find({ 
      status: { $in: ['pending', 'processing', 'ready'] }
    });

    const impact = {};
    
    // Calculate pending impact on inventory
    for (const order of pendingOrders) {
      for (const item of order.products) {
        if (!impact[item.productId]) {
          impact[item.productId] = {
            productName: item.name,
            pendingQuantity: 0,
            pendingOrders: 0
          };
        }
        impact[item.productId].pendingQuantity += item.quantity;
        impact[item.productId].pendingOrders += 1;
      }
    }

    res.json(impact);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending inventory impact' });
  }
});

// Enhanced Analytics Routes
app.get('/api/analytics/sales-by-product', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' });
    const productSales = {};
    
    orders.forEach(order => {
      order.products.forEach(product => {
        if (!productSales[product.name]) {
          productSales[product.name] = {
            quantity: 0,
            revenue: 0
          };
        }
        productSales[product.name].quantity += product.quantity;
        productSales[product.name].revenue += product.price * product.quantity;
      });
    });

    res.json(productSales);
  } catch (error) {
    console.error('Error fetching sales by product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/monthly-revenue', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const orders = await Order.find({
      status: 'completed',
      createdAt: { $gte: sixMonthsAgo }
    });

    const monthlyRevenue = {};
    orders.forEach(order => {
      const monthYear = new Date(order.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] = 0;
      }
      order.products.forEach(product => {
        monthlyRevenue[monthYear] += product.price * product.quantity;
      });
    });

    res.json(monthlyRevenue);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/inventory-metrics', async (req, res) => {
  try {
    const products = await Product.find();
    const metrics = {
      lowStock: [],
      outOfStock: [],
      topSelling: [],
      reorderSuggestions: []
    };

    products.forEach(product => {
      // Low stock check (less than 20% of max capacity)
      if (product.stock < product.maxCapacity * 0.2 && product.stock > 0) {
        metrics.lowStock.push({
          name: product.name,
          stock: product.stock,
          maxCapacity: product.maxCapacity
        });
      }

      // Out of stock
      if (product.stock === 0) {
        metrics.outOfStock.push({
          name: product.name,
          maxCapacity: product.maxCapacity
        });
      }

      // Reorder suggestions
      if (product.stock < product.reorderPoint) {
        metrics.reorderSuggestions.push({
          name: product.name,
          currentStock: product.stock,
          reorderPoint: product.reorderPoint,
          suggestedOrder: product.maxCapacity - product.stock
        });
      }
    });

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching inventory metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Daily Revenue Data
app.get('/api/analytics/daily-revenue', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await Order.find({
      orderDate: { $gte: thirtyDaysAgo }
    }).populate('products.productId');

    // Group orders by date and calculate daily revenue
    const dailyRevenue = {};
    
    orders.forEach(order => {
      const date = order.orderDate.toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += order.totalAmount;
    });

    // Fill in missing dates with zero revenue
    const result = [];
    for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split('T')[0];
      result.push({
        date,
        revenue: dailyRevenue[date] || 0
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    res.status(500).json({ error: 'Error fetching daily revenue data' });
  }
});

// Raw Materials routes
app.get('/api/raw-materials', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const materials = await RawMaterial.find();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching raw materials' });
  }
});

app.get('/api/raw-materials/usage-stats', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const materials = await RawMaterial.find();
    const usageStats = materials.map(material => ({
      name: material.name,
      usage: material.usageHistory
        .filter(usage => new Date(usage.date) >= thirtyDaysAgo)
        .reduce((sum, usage) => sum + usage.quantity, 0),
      cost: material.usageHistory
        .filter(usage => new Date(usage.date) >= thirtyDaysAgo)
        .reduce((sum, usage) => sum + (usage.quantity * material.unitCost), 0)
    }));
    
    res.json(usageStats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching usage statistics' });
  }
});

app.post('/api/raw-materials/:id/restock', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const { quantity } = req.body;
    const material = await RawMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Raw material not found' });
    }

    await material.restock(quantity);
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Error restocking raw material' });
  }
});

// Start the server
startServer();
