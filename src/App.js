// src/App.js
import Kitchen from './Kitchen';
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Import the routing tools
import OrderPage from './OrderPage'; // Import the page we just created

function App() {
  return (
    <div className="App">
      {/* The Routes component acts like a switchboard */}
      <Routes>
        
        {/* Route 1: The Order Page (This is where the QR code points) */}
        <Route path="/order" element={<OrderPage />} />

        {/* Route 2: Home Page (If someone goes to the main site without a QR code) */}
        <Route path="/" element={<h1>Welcome to The Backyards Homepage</h1>} />
        
        <Route path="/kitchen" element={<Kitchen />} />
        
      </Routes>
    </div>
  );
}

export default App;