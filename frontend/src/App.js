import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Navigation from './components/Navigation';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import Inventory from './components/Inventory';
import RawMaterials from './components/RawMaterials';
import CRM from './components/CRM';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="content">
          <Routes>
            <Route path="/" element={<OrderForm />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/raw-materials" element={<RawMaterials />} />
            <Route path="/crm" element={<CRM />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
