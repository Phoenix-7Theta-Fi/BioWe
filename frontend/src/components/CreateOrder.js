import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateOrder.css';

const CreateOrder = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5202/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phoneNumber || cart.length === 0) {
      setError('Please fill in all fields and add products to cart');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5202/api/orders', {
        customerName,
        phoneNumber,
        products: cart,
        status: 'pending'
      });
      
      // Clear form
      setCustomerName('');
      setPhoneNumber('');
      setCart([]);
      setError('');
      
      // Optional: redirect to orders list
      window.location.href = '/orders';
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order');
    }
    setLoading(false);
  };

  return (
    <div className="create-order-container">
      <div className="create-order-form">
        <h2>Create New Order</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="customer-info">
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

        <div className="order-content">
          <div className="products-list">
            <h3>Available Products</h3>
            <div className="products-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image"><img src={product.imageUrl} alt={product.name} /></div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="price">₹{product.price.toFixed(2)}</p>
                    <button className="add-to-cart" onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-section">
            <h3>Cart</h3>
            {cart.length === 0 ? (
              <p>No items in cart</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">₹{item.price.toFixed(2)}</span>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total:</strong> ₹{calculateTotal().toFixed(2)}
                </div>
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Creating Order...' : 'Create Order'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
