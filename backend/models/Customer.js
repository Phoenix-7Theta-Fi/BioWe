const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  customerType: {
    type: String,
    enum: ['retail', 'wholesale', 'distributor', 'agriculture'],
    required: true
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: String,
    enum: ['prepaid', 'net15', 'net30', 'net60'],
    default: 'prepaid'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  notes: String,
  assignedRepresentative: {
    type: String,
    required: true
  },
  tags: [String],
  preferences: {
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'sms'],
      default: 'email'
    },
    marketingOptIn: {
      type: Boolean,
      default: true
    },
    preferredDeliveryDays: [String],
    specialInstructions: String
  },
  metrics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    lastContactDate: Date
  },
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'invoice', 'quote', 'other']
    },
    name: String,
    url: String,
    date: Date
  }],
  interactions: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'site_visit', 'support']
    },
    summary: String,
    outcome: String,
    nextFollowUp: Date,
    representative: String
  }]
}, {
  timestamps: true
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  const { street, city, state, country, postalCode } = this.address;
  return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
});

// Method to calculate customer lifetime value
customerSchema.methods.calculateLifetimeValue = function() {
  return this.metrics.totalSpent;
};

// Method to add interaction
customerSchema.methods.addInteraction = async function(interaction) {
  this.interactions.push(interaction);
  this.metrics.lastContactDate = interaction.date;
  return this.save();
};

// Method to update metrics after order
customerSchema.methods.updateMetricsAfterOrder = async function(orderAmount) {
  this.metrics.totalOrders += 1;
  this.metrics.totalSpent += orderAmount;
  this.metrics.averageOrderValue = this.metrics.totalSpent / this.metrics.totalOrders;
  this.metrics.lastOrderDate = new Date();
  return this.save();
};

// Static method to find high-value customers
customerSchema.statics.findHighValueCustomers = function(threshold) {
  return this.find({
    'metrics.totalSpent': { $gt: threshold }
  }).sort({ 'metrics.totalSpent': -1 });
};

// Static method to find customers needing follow-up
customerSchema.statics.findNeedingFollowUp = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    'metrics.lastContactDate': { $lt: thirtyDaysAgo },
    'status': 'active'
  }).sort({ 'metrics.lastContactDate': 1 });
};

module.exports = mongoose.model('Customer', customerSchema);
