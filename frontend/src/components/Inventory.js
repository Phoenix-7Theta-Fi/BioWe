import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [inventoryMetrics, setInventoryMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [
        productsRes,
        salesRes,
        revenueRes,
        metricsRes
      ] = await Promise.all([
        axios.get('http://localhost:5202/api/products'),
        axios.get('http://localhost:5202/api/analytics/sales-by-product'),
        axios.get('http://localhost:5202/api/analytics/daily-revenue'),
        axios.get('http://localhost:5202/api/analytics/inventory-metrics')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (salesRes.data) setSalesData(salesRes.data);
      if (revenueRes.data) setDailyRevenue(revenueRes.data);
      if (metricsRes.data) setInventoryMetrics(metricsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || err.response?.data?.details || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const prepareSalesData = () => {
    return Object.entries(salesData).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue
    }));
  };

  const handleRestock = async (productId) => {
    try {
      const quantity = window.prompt('Enter quantity to restock:', '100');
      if (!quantity) return;

      const numQuantity = Number(quantity);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        alert('Please enter a valid positive number');
        return;
      }

      const response = await axios.post(`http://localhost:5202/api/products/${productId}/restock`, {
        quantity: numQuantity
      });

      if (response.data) {
        alert(response.data.message);
        fetchData(); // Refresh the data
      }
    } catch (err) {
      console.error('Error restocking:', err);
      alert(err.response?.data?.error || err.response?.data?.details || 'Failed to restock product');
    }
  };

  const renderActions = (product) => (
    <div className="actions-cell">
      <button
        className="restock-btn"
        onClick={() => handleRestock(product._id)}
        disabled={loading}
      >
        Restock
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading inventory data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-dashboard">
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Daily Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                name="Revenue"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Product Sales Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareSalesData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Revenue' : 'Quantity Sold'
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
              <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="inventory-table-container">
        <h3>Product Inventory</h3>
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder Point</th>
                <th>Available Stock</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Last Restocked</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td className="product-cell">
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-description">{product.description}</div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.stockQuantity} {product.unit}</td>
                  <td>{product.lowStockThreshold} {product.unit}</td>
                  <td>{product.stockQuantity} {product.unit}</td>
                  <td>{formatCurrency(product.cost)}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.lastRestocked ? new Date(product.lastRestocked).toLocaleDateString() : 'Not Available'}</td>
                  <td>
                    <span className={`status-badge ${
                      product.status === 'Out of Stock' ? 'out-of-stock' :
                      product.status === 'Low Stock' ? 'low-stock' : 'in-stock'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{renderActions(product)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Section */}
      {(inventoryMetrics.reorderSuggestions?.length > 0 || inventoryMetrics.lowStock?.length > 0) && (
        <div className="alerts-section">
          <h3>Inventory Alerts</h3>
          <div className="alerts-grid">
            {inventoryMetrics.reorderSuggestions?.map(item => (
              <div key={item.name} className="alert-card reorder">
                <h4>{item.name}</h4>
                <p>Current Stock: {item.currentStock}</p>
                <p>Reorder Point: {item.reorderPoint}</p>
                <p>Suggested Order: {item.suggestedOrder} units</p>
              </div>
            ))}
            {inventoryMetrics.lowStock?.map(item => (
              <div key={item.name} className="alert-card low-stock">
                <h4>{item.name}</h4>
                <p>Current Stock: {item.stock}</p>
                <p>Max Capacity: {item.maxCapacity}</p>
                <p>Stock Level: {Math.round((item.stock / item.maxCapacity) * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
