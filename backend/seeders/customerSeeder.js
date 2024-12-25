const mongoose = require('mongoose');
const Customer = require('../models/Customer');
require('dotenv').config();

const representatives = [
  'John Smith',
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez'
];

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const customers = [
  {
    name: 'Green Fields Farm',
    company: 'Green Fields Enterprises',
    email: 'contact@greenfields.com',
    phone: '+1-555-0101',
    address: {
      street: '123 Farm Road',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      postalCode: '62701'
    },
    customerType: 'agriculture',
    creditLimit: 50000,
    paymentTerms: 'net30',
    assignedRepresentative: 'John Smith',
    tags: ['organic', 'large-scale', 'premium'],
    preferences: {
      preferredContactMethod: 'email',
      preferredDeliveryDays: ['Monday', 'Wednesday']
    },
    metrics: {
      totalOrders: 45,
      totalSpent: 125000,
      averageOrderValue: 2777.78,
      lastOrderDate: new Date('2024-12-01'),
      lastContactDate: new Date('2024-12-15')
    }
  },
  {
    name: 'Urban Growers Co-op',
    company: 'Urban Growers Collective',
    email: 'orders@urbangrowers.org',
    phone: '+1-555-0102',
    address: {
      street: '456 City Garden Ave',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      postalCode: '60601'
    },
    customerType: 'wholesale',
    creditLimit: 25000,
    paymentTerms: 'net15',
    assignedRepresentative: 'Sarah Johnson',
    tags: ['urban-farming', 'community', 'organic'],
    preferences: {
      preferredContactMethod: 'phone',
      preferredDeliveryDays: ['Tuesday', 'Friday']
    },
    metrics: {
      totalOrders: 28,
      totalSpent: 45000,
      averageOrderValue: 1607.14,
      lastOrderDate: new Date('2024-12-10'),
      lastContactDate: new Date('2024-12-12')
    }
  }
];

// Generate 18 more customers
const companies = [
  'Sunshine Farms', 'Valley Agriculture', 'City Gardens', 'Fresh Produce Co',
  'Green Thumb Industries', 'Harvest Holdings', 'Nature\'s Best', 'Farm Fresh Ltd',
  'Organic Ventures', 'Growth Solutions', 'Earth\'s Bounty', 'Crop Care Inc',
  'Garden Glory', 'Plant Perfect', 'Fertile Fields', 'Grow Right',
  'Soil Solutions', 'Agrarian Arts'
];

const cities = [
  'Los Angeles', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis',
  'Seattle', 'Denver', 'Boston'
];

const states = [
  'CA', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL',
  'TX', 'OH', 'CA', 'NC', 'IN', 'WA', 'CO', 'MA'
];

for (let i = 0; i < 18; i++) {
  const companyName = companies[i];
  const customerName = `${companyName} Management`;
  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  
  customers.push({
    name: customerName,
    company: companyName,
    email: `contact@${domain}`,
    phone: `+1-555-${String(i + 103).padStart(4, '0')}`,
    address: {
      street: `${1000 + i} Business Park Dr`,
      city: cities[i],
      state: states[i],
      country: 'USA',
      postalCode: String(10000 + Math.floor(Math.random() * 90000))
    },
    customerType: getRandomElement(['retail', 'wholesale', 'distributor', 'agriculture']),
    creditLimit: Math.floor(Math.random() * 40000) + 10000,
    paymentTerms: getRandomElement(['prepaid', 'net15', 'net30', 'net60']),
    assignedRepresentative: getRandomElement(representatives),
    tags: [
      getRandomElement(['organic', 'conventional', 'hydroponic']),
      getRandomElement(['small-scale', 'medium-scale', 'large-scale']),
      getRandomElement(['new', 'regular', 'premium'])
    ],
    preferences: {
      preferredContactMethod: getRandomElement(['email', 'phone', 'sms']),
      preferredDeliveryDays: [
        getRandomElement(['Monday', 'Tuesday', 'Wednesday']),
        getRandomElement(['Thursday', 'Friday'])
      ]
    },
    metrics: {
      totalOrders: Math.floor(Math.random() * 40) + 5,
      totalSpent: Math.floor(Math.random() * 100000) + 10000,
      averageOrderValue: 0, // Will be calculated
      lastOrderDate: getRandomDate(new Date('2024-01-01'), new Date()),
      lastContactDate: getRandomDate(new Date('2024-11-01'), new Date())
    }
  });
}

// Calculate average order value for each customer
customers.forEach(customer => {
  customer.metrics.averageOrderValue = customer.metrics.totalSpent / customer.metrics.totalOrders;
});

const seedCustomers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing customers
    await Customer.deleteMany({});
    console.log('Cleared existing customers');

    // Insert new customers
    const result = await Customer.insertMany(customers);
    console.log(`Seeded ${result.length} customers`);

    console.log('Customer seeding completed successfully');
  } catch (error) {
    console.error('Error seeding customers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
seedCustomers();
