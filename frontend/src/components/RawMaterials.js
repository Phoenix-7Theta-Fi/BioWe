import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './RawMaterials.css';

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usageStats, setUsageStats] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5202/api/raw-materials'),
        axios.get('http://localhost:5202/api/raw-materials/usage-stats')
      ]);

      setMaterials(materialsRes.data || []);
      setUsageStats(statsRes.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching raw materials data:', err);
      setError('Error fetching raw materials data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedMaterial || !restockQuantity || restockQuantity <= 0) {
      setError('Please enter a valid restock quantity');
      return;
    }

    try {
      await axios.post(`http://localhost:5202/api/raw-materials/${selectedMaterial._id}/restock`, {
        quantity: parseInt(restockQuantity)
      });
      setSelectedMaterial(null);
      setRestockQuantity('');
      fetchData();
    } catch (err) {
      setError('Error restocking material. Please try again.');
    }
  };

  const getDaysUntilReorder = (material) => {
    const dailyUsage = material.usageHistory.reduce((sum, usage) => sum + usage.quantity, 0) / 30;
    if (dailyUsage === 0) return Infinity;
    return Math.floor((material.currentStock - material.reorderPoint) / dailyUsage);
  };

  if (loading) {
    return <div className="loading">Loading raw materials data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="raw-materials-container">
      <h2>Raw Materials Management</h2>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="stat-card">
          <h3>Total Materials</h3>
          <p>{materials.length}</p>
        </div>
        <div className="stat-card warning">
          <h3>Low Stock Items</h3>
          <p>{materials.filter(m => m.currentStock <= m.reorderPoint).length}</p>
        </div>
        <div className="stat-card danger">
          <h3>Out of Stock</h3>
          <p>{materials.filter(m => m.currentStock === 0).length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Value</h3>
          <p>₹{materials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="chart-section">
        <h3>Material Usage Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usageStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="usage" name="Monthly Usage" fill="#8884d8" />
            <Bar dataKey="cost" name="Monthly Cost" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Materials List */}
      <div className="materials-list-section">
        <h3>Raw Materials Inventory</h3>
        <table className="materials-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Minimum Required</th>
              <th>Reorder Point</th>
              <th>Unit Cost</th>
              <th>Supplier</th>
              <th>Lead Time</th>
              <th>Days Until Reorder</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => {
              const daysUntilReorder = getDaysUntilReorder(material);
              return (
                <tr key={material._id}>
                  <td>
                    <div className="material-name">
                      {material.name}
                      <span className="material-description">{material.description}</span>
                    </div>
                  </td>
                  <td>{material.category}</td>
                  <td>{material.currentStock} {material.unit}</td>
                  <td>{material.minimumRequired} {material.unit}</td>
                  <td>{material.reorderPoint} {material.unit}</td>
                  <td>₹{material.unitCost.toFixed(2)}</td>
                  <td>
                    <div className="supplier-info">
                      {material.supplier.name}
                      <span className="supplier-contact">{material.supplier.contact}</span>
                    </div>
                  </td>
                  <td>{material.supplier.leadTime} days</td>
                  <td>
                    <span className={`days-until-reorder ${
                      daysUntilReorder <= 7 ? 'warning' : ''
                    }`}>
                      {daysUntilReorder === Infinity ? '∞' : daysUntilReorder}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      material.currentStock === 0 ? 'out-of-stock' :
                      material.currentStock <= material.reorderPoint ? 'low-stock' : 'in-stock'
                    }`}>
                      {material.currentStock === 0 ? 'Out of Stock' :
                       material.currentStock <= material.reorderPoint ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="restock-button"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Storage Conditions */}
      <div className="storage-conditions-section">
        <h3>Storage Conditions</h3>
        <div className="conditions-grid">
          {materials.map(material => (
            <div key={material._id} className="condition-card">
              <h4>{material.name}</h4>
              <div className="condition-details">
                <p>Temperature: {material.storageConditions.temperature.min}°C - {material.storageConditions.temperature.max}°C</p>
                <p>Humidity: {material.storageConditions.humidity.min}% - {material.storageConditions.humidity.max}%</p>
                <p className="special-instructions">{material.storageConditions.specialInstructions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restock Modal */}
      {selectedMaterial && (
        <div className="modal">
          <div className="modal-content">
            <h3>Restock {selectedMaterial.name}</h3>
            <div className="modal-body">
              <label>
                Quantity to add ({selectedMaterial.unit}):
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                />
              </label>
              <div className="supplier-details">
                <p>Supplier: {selectedMaterial.supplier.name}</p>
                <p>Contact: {selectedMaterial.supplier.contact}</p>
                <p>Lead Time: {selectedMaterial.supplier.leadTime} days</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleRestock}>Confirm Order</button>
              <button onClick={() => {
                setSelectedMaterial(null);
                setRestockQuantity('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterials;
