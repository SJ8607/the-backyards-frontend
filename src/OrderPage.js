import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const MENU_ITEMS = [
  { id: 1, name: 'Classic Burger', price: 149, category: 'Food', desc: 'Juicy patty with fresh lettuce' },
  { id: 2, name: 'Peri Peri Fries', price: 99, category: 'Food', desc: 'Crispy fries with spicy masala' },
  { id: 3, name: 'Cold Coffee', price: 129, category: 'Drinks', desc: 'Rich and creamy cold brew' },
  { id: 4, name: 'Masala Chai', price: 49, category: 'Drinks', desc: 'Traditional Indian tea' },
];

function OrderPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableNumber = queryParams.get('table');

  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false); 

  const addToCart = (itemId) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const currentQty = prev[itemId] || 0;
      if (currentQty <= 0) return prev;
      const newCart = { ...prev, [itemId]: currentQty - 1 };
      if (newCart[itemId] === 0) delete newCart[itemId]; 
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  
  const totalPrice = MENU_ITEMS.reduce((total, item) => {
    const qty = cart[item.id] || 0;
    return total + (item.price * qty);
  }, 0);

  // --- PLACE ORDER FUNCTION ---
  const handlePlaceOrder = async () => {
    const orderDetails = {
      tableNumber: tableNumber,
      items: cart,
      totalAmount: totalPrice
    };

    try {
      const response = await fetch('https://the-backyards-api.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      });

      if (response.ok) {
        const data = await response.json();
        alert("✅ Order Placed Successfully! Order ID: " + data.orderId);
        setCart({}); 
        setIsCartOpen(false); 
      } else {
        alert("❌ Failed to place order.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to server.");
    }
  };

  // --- 1. IF CART IS OPEN -> SHOW SUMMARY SCREEN ---
  if (isCartOpen) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <button 
          onClick={() => setIsCartOpen(false)}
          style={{ marginBottom: '20px', padding: '10px', background: '#ddd', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          &larr; Back to Menu
        </button>
        
        <h2>Your Order (Table {tableNumber})</h2>
        <hr />
        
        {Object.keys(cart).map((itemId) => {
          const item = MENU_ITEMS.find(i => i.id === parseInt(itemId));
          const qty = cart[itemId];
          return (
            <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', fontSize: '18px' }}>
              <span>{qty} x {item.name}</span>
              <span>₹{item.price * qty}</span>
            </div>
          );
        })}
        
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
          <span>Grand Total</span>
          <span>₹{totalPrice}</span>
        </div>

        <button 
          onClick={handlePlaceOrder}
          style={{ 
            width: '100%', padding: '15px', marginTop: '30px', 
            backgroundColor: 'black', color: 'white', fontSize: '18px', fontWeight: 'bold', 
            border: 'none', borderRadius: '10px', cursor: 'pointer' 
          }}>
          PLACE ORDER &rarr;
        </button>
      </div>
    );
  }

  // --- 2. DEFAULT -> SHOW MENU SCREEN ---
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#333', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>The Backyards 🌿</h1>
        <p>Ordering for <strong>Table {tableNumber || 'Unknown'}</strong></p>
      </div>

      {/* Menu List */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h2>Menu</h2>
        {MENU_ITEMS.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <div key={item.id} style={{ 
              border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{item.desc}</p>
                <p style={{ fontWeight: 'bold', color: '#d32f2f', marginTop: '5px' }}>₹{item.price}</p>
              </div>
              <div>
                {qty === 0 ? (
                  <button onClick={() => addToCart(item.id)} style={{ backgroundColor: 'white', color: 'green', border: '1px solid green', padding: '8px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>ADD</button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#008000', borderRadius: '5px' }}>
                    <button onClick={() => removeFromCart(item.id)} style={{ backgroundColor: 'transparent', color: 'white', border: 'none', padding: '5px 10px', fontSize: '18px', cursor: 'pointer' }}>-</button>
                    <span style={{ color: 'white', fontWeight: 'bold', padding: '0 5px' }}>{qty}</span>
                    <button onClick={() => addToCart(item.id)} style={{ backgroundColor: 'transparent', color: 'white', border: 'none', padding: '5px 10px', fontSize: '18px', cursor: 'pointer' }}>+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Cart Bar */}
      {totalItems > 0 && (
        <div style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          backgroundColor: '#008000', color: 'white', 
          padding: '15px 20px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000 /* Fixes the clickable issue */
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px' }}>{totalItems} ITEMS</p>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>₹{totalPrice}</p>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)} 
            style={{ 
                backgroundColor: 'white', color: '#008000', border: 'none', 
                padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer',
                pointerEvents: 'auto'
            }}>
            VIEW CART &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderPage;