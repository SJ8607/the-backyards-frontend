import React, { useState, useEffect } from 'react';

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]); // Store the menu here to look up names

  // --- 1. FETCH MENU (To translate IDs to Names) ---
  const fetchMenu = async () => {
    try {
      const response = await fetch('https://the-backyards-api.onrender.com/api/menu');
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  // --- 2. FETCH ORDERS FUNCTION ---
  const fetchOrders = async () => {
    try {
      const response = await fetch('https://the-backyards-api.onrender.com/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // --- 3. AUTO-REFRESH (Every 5 seconds) ---
  useEffect(() => {
    fetchMenu();   // Get names once when page loads
    fetchOrders(); // Get initial orders
    
    const interval = setInterval(fetchOrders, 5000); // Poll orders every 5 sec
    return () => clearInterval(interval); 
  }, []);

  // --- 4. MARK AS DONE FUNCTION ---
  const handleCompleteOrder = async (orderId) => {
    try {
      await fetch(`https://the-backyards-api.onrender.com/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      fetchOrders(); // Refresh list immediately
    } catch (error) {
      alert("Error completing order");
    }
  };

  // Helper to find name from ID
  const getItemName = (id) => {
    const foundItem = menu.find(item => item._id === id);
    return foundItem ? foundItem.name : id; // Return Name if found, else return ID
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#222', minHeight: '100vh', color: 'white' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <h1>👨‍🍳 Kitchen Display System (KDS)</h1>
        <button onClick={fetchOrders} style={{ padding:'10px 20px', background:'orange', border:'none', cursor:'pointer', fontWeight:'bold' }}>🔄 REFRESH</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {orders.length === 0 && <p>No pending orders. Kitchen is quiet... 💤</p>}

        {orders.map((order) => (
          <div key={order._id} style={{ 
            backgroundColor: 'white', color: 'black', width: '300px', 
            borderRadius: '10px', padding: '15px', borderLeft: '10px solid orange',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)' 
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #ccc', paddingBottom:'10px', marginBottom:'10px' }}>
              <h2 style={{ margin:0 }}>Table {order.tableNumber}</h2>
              <span style={{ fontSize:'12px', color:'#666' }}>{new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            
            {/* ITEM LIST */}
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              {Object.entries(order.items).map(([itemId, qty]) => (
                <li key={itemId} style={{ fontSize:'18px', fontWeight:'bold', marginBottom:'5px' }}>
                  {qty} x {getItemName(itemId)} 
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleCompleteOrder(order._id)}
              style={{ width:'100%', padding:'15px', backgroundColor:'#28a745', color:'white', border:'none', fontSize:'16px', cursor:'pointer', borderRadius:'5px' }}>
              ✅ ORDER READY
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Kitchen;