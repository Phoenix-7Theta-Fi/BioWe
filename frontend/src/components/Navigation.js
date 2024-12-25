import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link to="/" className="nav-brand">BioWe</Link>
        <div className="nav-links">
          <Link to="/orders" className={location.pathname === '/orders' ? 'nav-link active' : 'nav-link'}>Orders</Link>
          <Link to="/inventory" className={location.pathname === '/inventory' ? 'nav-link active' : 'nav-link'}>Inventory</Link>
          <Link to="/raw-materials" className={location.pathname === '/raw-materials' ? 'nav-link active' : 'nav-link'}>Raw Materials</Link>
          <Link to="/crm" className={location.pathname === '/crm' ? 'nav-link active' : 'nav-link'}>CRM</Link>
        </div>
      </div>
      <div className="nav-right">
        <Link to="/" className="nav-link">Create Order</Link>
        <Link to="/orders" className="nav-link">Order List</Link>
      </div>
    </nav>
  );
};

export default Navigation;
