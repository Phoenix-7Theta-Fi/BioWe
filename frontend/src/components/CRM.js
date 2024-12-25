import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import './CRM.css';

const CRM = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newInteraction, setNewInteraction] = useState({
    type: 'call',
    summary: '',
    outcome: '',
    nextFollowUp: '',
    representative: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching customers from:', process.env.REACT_APP_API_URL);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/customers`);
      console.log('Customer data received:', response.data);
      setCustomers(response.data);
    } catch (err) {
      console.error('Error details:', err.response || err);
      setError(err.response?.data?.error || err.message || 'Error fetching customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/customers/${selectedCustomer._id}/interactions`, newInteraction);
      setSelectedCustomer(null);
      setNewInteraction({
        type: 'call',
        summary: '',
        outcome: '',
        nextFollowUp: '',
        representative: ''
      });
      fetchCustomers();
    } catch (err) {
      setError('Error adding interaction');
    }
  };

  const getFilteredCustomers = () => {
    return customers
      .filter(customer => {
        if (filterType !== 'all' && customer.customerType !== filterType) return false;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          customer.name.toLowerCase().includes(searchLower) ||
          customer.company.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'totalSpent') {
          comparison = a.metrics.totalSpent - b.metrics.totalSpent;
        } else if (sortField === 'lastOrder') {
          comparison = new Date(a.metrics.lastOrderDate) - new Date(b.metrics.lastOrderDate);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  };

  const customerTypeData = customers.reduce((acc, customer) => {
    const type = customer.customerType;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading CRM data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const filteredCustomers = getFilteredCustomers();

  return (
    <div className="crm-container">
      <h2>Customer Relationship Management</h2>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{customers.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>{formatCurrency(customers.reduce((sum, c) => sum + c.metrics.totalSpent, 0))}</p>
        </div>
        <div className="stat-card">
          <h3>Average Order Value</h3>
          <p>{formatCurrency(
            customers.reduce((sum, c) => sum + c.metrics.averageOrderValue, 0) / customers.length
          )}</p>
        </div>
        <div className="stat-card">
          <h3>Active Customers</h3>
          <p>{customers.filter(c => c.status === 'active').length}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Customer Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {customerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Top Customers by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={customers
                .sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent)
                .slice(0, 5)
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="metrics.totalSpent" name="Total Spent" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
            <option value="agriculture">Agriculture</option>
          </select>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="totalSpent">Sort by Total Spent</option>
            <option value="lastOrder">Sort by Last Order</option>
          </select>
          <button onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="customer-list">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer._id}>
                <td>
                  <div className="customer-name">
                    <strong>{customer.name}</strong>
                    <span className="company-name">{customer.company}</span>
                  </div>
                </td>
                <td>
                  <span className={`customer-type ${customer.customerType}`}>
                    {customer.customerType}
                  </span>
                </td>
                <td>
                  <div className="contact-info">
                    <div>{customer.email}</div>
                    <div>{customer.phone}</div>
                  </div>
                </td>
                <td>{customer.metrics.totalOrders}</td>
                <td>{formatCurrency(customer.metrics.totalSpent)}</td>
                <td>{customer.metrics.lastOrderDate ? formatDate(customer.metrics.lastOrderDate) : 'Never'}</td>
                <td>
                  <span className={`status-badge ${customer.status}`}>
                    {customer.status}
                  </span>
                </td>
                <td>
                  <button
                    className="view-details-button"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedCustomer.name}</h2>
              <button onClick={() => setSelectedCustomer(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="customer-details">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <p><strong>Company:</strong> {selectedCustomer.company}</p>
                  <p><strong>Type:</strong> {selectedCustomer.customerType}</p>
                  <p><strong>Status:</strong> {selectedCustomer.status}</p>
                  <p><strong>Representative:</strong> {selectedCustomer.assignedRepresentative}</p>
                </div>

                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  <p><strong>Address:</strong> {selectedCustomer.address.street}, {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.postalCode}</p>
                </div>

                <div className="detail-section">
                  <h3>Business Details</h3>
                  <p><strong>Credit Limit:</strong> {formatCurrency(selectedCustomer.creditLimit)}</p>
                  <p><strong>Payment Terms:</strong> {selectedCustomer.paymentTerms}</p>
                  <p><strong>Tags:</strong> {selectedCustomer.tags.join(', ')}</p>
                </div>

                <div className="detail-section">
                  <h3>Metrics</h3>
                  <p><strong>Total Orders:</strong> {selectedCustomer.metrics.totalOrders}</p>
                  <p><strong>Total Spent:</strong> {formatCurrency(selectedCustomer.metrics.totalSpent)}</p>
                  <p><strong>Average Order Value:</strong> {formatCurrency(selectedCustomer.metrics.averageOrderValue)}</p>
                  <p><strong>Last Order:</strong> {formatDate(selectedCustomer.metrics.lastOrderDate)}</p>
                </div>

                <div className="detail-section">
                  <h3>Preferences</h3>
                  <p><strong>Preferred Contact:</strong> {selectedCustomer.preferences.preferredContactMethod}</p>
                  <p><strong>Delivery Days:</strong> {selectedCustomer.preferences.preferredDeliveryDays.join(', ')}</p>
                  {selectedCustomer.preferences.specialInstructions && (
                    <p><strong>Special Instructions:</strong> {selectedCustomer.preferences.specialInstructions}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Interactions</h3>
                  <div className="interactions-list">
                    {selectedCustomer.interactions.map((interaction, index) => (
                      <div key={index} className="interaction-item">
                        <p><strong>{formatDate(interaction.date)} - {interaction.type}</strong></p>
                        <p>{interaction.summary}</p>
                        <p><em>Outcome: {interaction.outcome}</em></p>
                        <p>Next Follow-up: {formatDate(interaction.nextFollowUp)}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleInteractionSubmit} className="interaction-form">
                    <h4>Add New Interaction</h4>
                    <select
                      value={newInteraction.type}
                      onChange={(e) => setNewInteraction({...newInteraction, type: e.target.value})}
                    >
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="site_visit">Site Visit</option>
                      <option value="support">Support</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Summary"
                      value={newInteraction.summary}
                      onChange={(e) => setNewInteraction({...newInteraction, summary: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Outcome"
                      value={newInteraction.outcome}
                      onChange={(e) => setNewInteraction({...newInteraction, outcome: e.target.value})}
                    />
                    <input
                      type="date"
                      value={newInteraction.nextFollowUp}
                      onChange={(e) => setNewInteraction({...newInteraction, nextFollowUp: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Representative"
                      value={newInteraction.representative}
                      onChange={(e) => setNewInteraction({...newInteraction, representative: e.target.value})}
                    />
                    <button type="submit">Add Interaction</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
