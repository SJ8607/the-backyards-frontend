import React, { useState, useEffect } from 'react';

// Copying the menu here so the Kitchen knows the names
// (In a real app, we would fetch this from the database too!)
const MENU_ITEMS = [
  { id: 1, name: 'Classic Burger' },
  { id: 2, name: 'Peri Peri Fries' },
  { id: 3, name: 'Cold Coffee' },
  { id: 4, name: 'Masala Chai' },
];

function Kitchen() {
  const [orders, setOrders] = useState([]);

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('hhttps://the-backyards-api.onrender.com/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Initial Load & Auto-Refresh
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  // --- NEW: HANDLE "ORDER READY" ---
  const handleOrderReady = async (orderId) => {
    try {
      // Call the backend DELETE endpoint
      await fetch(`https://the-backyards-api.onrender.com/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      // Refresh the list immediately
      fetchOrders(); 
    } catch (error) {
      alert("Error updating order");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#222', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ textAlign: 'center', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        👨‍🍳 KITCHEN DISPLAY SYSTEM (KDS)
      </h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        {orders.length === 0 ? (
          <p style={{ color: '#888', fontSize: '20px' }}>No active orders. Waiting...</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} style={{ 
              border: '4px solid #e65100', // Orange border for visibility
              backgroundColor: 'white',
              color: 'black',
              width: '300px', 
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 0 15px rgba(255, 165, 0, 0.5)'
            }}>
              
              {/* Card Header */}
              <div style={{ backgroundColor: '#e65100', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: 'white', fontSize: '24px' }}>Table {order.tableNumber}</h2>
                <span style={{ backgroundColor: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>

              {/* Order List */}
              <div style={{ padding: '20px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.entries(order.items).map(([itemId, qty]) => {
                    // Lookup the name!
                    const item = MENU_ITEMS.find(i => i.id === parseInt(itemId));
                    return (
                      <li key={itemId} style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '1px dashed #ccc', paddingBottom: '5px' }}>
                        <strong style={{ color: '#d32f2f' }}>{qty} x</strong> {item ? item.name : 'Unknown Item'}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Complete Button */}
              <button 
                onClick={() => handleOrderReady(order._id)}
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  backgroundColor: '#2e7d32', // Green
                  color: 'white', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  cursor: 'pointer',
                  borderTop: '1px solid #ccc'
                }}>
                ✅ MARK AS READY
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Kitchen;