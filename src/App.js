import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrderPage from './OrderPage';
import Kitchen from './Kitchen';
import Admin from './Admin'; // <--- 1. IMPORT ADMIN

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/order" element={<OrderPage />} />
        <Route path="/kitchen" element={<Kitchen />} />
        
        {/* 2. ADD THIS ROUTE FOR THE ADMIN PAGE */}
        <Route path="/admin" element={<Admin />} /> 

        <Route path="/" element={<h1>Welcome to The Backyards Homepage</h1>} />
      </Routes>
    </div>
  );
}

export default App;