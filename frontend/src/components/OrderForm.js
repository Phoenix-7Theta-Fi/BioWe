import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderForm.css';

const OrderForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5202/api/products');
      setProducts(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again.');
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => ({
      ...prevCart,
      [product._id]: {
        product,
        quantity: (prevCart[product._id]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromCart = (productId) => {
    const newCart = { ...cart };
    delete newCart[productId];
    setCart(newCart);
  };

  const updateQuantity = (productId, change) => {
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      const currentQuantity = updatedCart[productId]?.quantity || 0;
      const newQuantity = currentQuantity + change;
      
      if (newQuantity <= 0) {
        delete updatedCart[productId];
      } else {
        updatedCart[productId] = {
          ...updatedCart[productId],
          quantity: newQuantity
        };
      }
      
      return updatedCart;
    });
  };

  const calculateTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim() || !phoneNumber.trim()) {
      setError('Please fill in all customer details.');
      return;
    }

    if (Object.keys(cart).length === 0) {
      setError('Please add at least one product to the cart.');
      return;
    }

    const orderData = {
      customerName,
      phoneNumber,
      products: Object.values(cart).map(item => ({
        id: item.product._id,
        quantity: item.quantity,
        name: item.product.name,
        price: item.product.price
      }))
    };

    try {
      await axios.post('http://localhost:5202/api/orders', orderData);
      setSuccess('Order created successfully!');
      setCustomerName('');
      setPhoneNumber('');
      setCart({});
      setError('');
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="order-form-container">
      <div className="customer-details">
        <h2>Create New Order</h2>
        <div className="form-group">
          <label>Customer Name:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="main-content">
        <div className="products-section">
          <h3>Available Products</h3>
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-icon">🌱</div>
                <h4>{product.name}</h4>
                <p className="product-description">{product.description}</p>
                <div className="price">₹{product.price.toFixed(2)}</div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  ADD
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h3>Cart</h3>
          <div className="cart-items">
            {Object.keys(cart).length === 0 ? (
              <p>No items in cart</p>
            ) : (
              Object.values(cart).map(({ product, quantity }) => (
                <div key={product._id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{product.name}</span>
                    <span className="cart-item-price">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(product._id, -1)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateQuantity(product._id, 1)}>+</button>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {Object.keys(cart).length > 0 && (
            <>
              <div className="cart-total">
                Total: ${calculateTotal().toFixed(2)}
              </div>
              <button 
                className="create-order-btn"
                onClick={handleSubmit}
              >
                Create Order
              </button>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
