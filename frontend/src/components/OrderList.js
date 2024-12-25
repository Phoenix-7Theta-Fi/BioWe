import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState({ pending: [], completed: [] });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5202/api/orders');
      const allOrders = response.data || [];
      
      // Separate orders by status
      const separated = allOrders.reduce((acc, order) => {
        if (order.status === 'completed') {
          acc.completed.push(order);
        } else {
          acc.pending.push(order);
        }
        return acc;
      }, { pending: [], completed: [] });

      setOrders(separated);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5202/api/orders/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5202/api/orders/${orderId}`);
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order.');
      }
    }
  };

  const statusOptions = ['pending', 'processing', 'ready', 'completed', 'cancelled'];

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5202/api/orders/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status.');
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5202/api/orders/${orderId}`);
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculateTotal = (products) => {
    if (!Array.isArray(products)) return 0;
    return products.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading && !orders.pending.length && !orders.completed.length) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-list-container">
      <div className="order-list-content">
        <div className="orders-section">
          <h2>Order List</h2>
          
          <div className="order-section">
            <h3>Pending Orders</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.pending.map(order => (
                  <tr key={order._id} onClick={() => setSelectedOrder(order)}>
                    <td>{order.customerName}</td>
                    <td>{order.phoneNumber}</td>
                    <td>
                      {order.products.map(p => (
                        <div key={p.id}>
                          {p.name} ({p.quantity})
                        </div>
                      ))}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`status-${order.status.toLowerCase()}`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-section">
            <h3>Completed Orders</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.completed.map(order => (
                  <tr key={order._id} onClick={() => setSelectedOrder(order)}>
                    <td>{order.customerName}</td>
                    <td>{order.phoneNumber}</td>
                    <td>
                      {order.products.map(p => (
                        <div key={p.id}>
                          {p.name} ({p.quantity})
                        </div>
                      ))}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`status-${order.status.toLowerCase()}`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="refresh-btn" onClick={fetchOrders}>
            Refresh Orders
          </button>
        </div>

        {selectedOrder && (
          <div className="order-details-card">
            <h3>Order Details</h3>
            <div className="order-info">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            </div>
            <div className="order-products">
              <h4>Products</h4>
              {selectedOrder.products.map(product => (
                <div key={product.id} className="order-product-item">
                  <span className="product-name">{product.name}</span>
                  <span className="product-quantity">x{product.quantity}</span>
                  <span className="product-price">₹{product.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="order-total">
                <strong>Total: ₹{selectedOrder.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}</strong>
              </div>
            </div>
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
