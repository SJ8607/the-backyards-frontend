import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function OrderPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableNumber = queryParams.get('table');

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- FETCH MENU ---
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('https://the-backyards-api.onrender.com/api/menu');
        const data = await response.json();
        setMenuItems(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // --- HELPER: GROUP ITEMS BY CATEGORY ---
  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      const cat = item.category || 'Others';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  };

  const groupedMenu = groupByCategory(menuItems);

  // --- CART LOGIC ---
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
  const totalPrice = menuItems.reduce((total, item) => {
    const qty = cart[item._id] || 0;
    return total + (item.price * qty);
  }, 0);

  // --- PAYMENT LOGIC ---
  const handlePaymentStart = () => setShowPaymentModal(true);

  const confirmPayment = async () => {
    setIsProcessingPayment(true);
    setTimeout(async () => {
      await sendOrderToBackend();
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }, 2000);
  };

  const sendOrderToBackend = async () => {
    const orderDetails = { tableNumber, items: cart, totalAmount: totalPrice };
    try {
      const response = await fetch('https://the-backyards-api.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Payment Successful! Order ID: ${data.orderId}`);
        setCart({});
        setIsCartOpen(false);
      } else {
        alert("❌ Order Failed. Please try again.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    }
  };

  // --- LOADING SCREEN ---
  if (loading) return <div style={{ padding:'50px', textAlign:'center', fontFamily:'serif' }}>Loading The Backyards Menu...</div>;

  // --- CART SCREEN (Simple List) ---
  if (isCartOpen) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <button onClick={() => setIsCartOpen(false)} style={{ marginBottom: '20px', padding: '10px' }}>&larr; Back to Menu</button>
        <h2>Your Order (Table {tableNumber})</h2>
        <hr />
        {Object.keys(cart).map((itemId) => {
          const item = menuItems.find(i => i._id === itemId);
          if (!item) return null;
          return (
            <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
              <span>{cart[itemId]} x {item.name}</span>
              <span>₹{item.price * cart[itemId]}</span>
            </div>
          );
        })}
        <h3>Total: ₹{totalPrice}</h3>
        <button onClick={handlePaymentStart} style={{ width: '100%', padding: '15px', backgroundColor: 'black', color: 'white', border: 'none', fontSize: '18px', marginTop: '20px' }}>PAY ₹{totalPrice} NOW</button>
        
        {/* PAYMENT POPUP */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', width: '300px' }}>
              {isProcessingPayment ? <h3>Processing...</h3> : (
                <div>
                  <h3>Confirm Payment</h3>
                  <button onClick={confirmPayment} style={{ width:'100%', padding:'10px', backgroundColor:'#28a745', color:'white', border:'none' }}>PAY ₹{totalPrice}</button>
                  <button onClick={() => setShowPaymentModal(false)} style={{ marginTop:'10px', background:'none', border:'none', color:'red' }}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- THE NEW "PAPER MENU" DESIGN ---
  return (
    <div style={{ 
      backgroundColor: '#dbbfa5', // Wood/Table color
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', // Texture
      backgroundSize: '20px 20px',
      minHeight: '100vh', 
      padding: '20px 10px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      
      {/* THE PAPER CLIPBOARD */}
      <div style={{ 
        backgroundColor: '#fffcf5', // Paper color (off-white)
        width: '100%',
        maxWidth: '500px',
        minHeight: '80vh',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        borderRadius: '5px',
        padding: '40px 25px',
        position: 'relative',
        color: '#2c2c2c'
      }}>
        
        {/* THE METAL CLIP AT TOP */}
        <div style={{ 
          position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
          width: '120px', height: '40px', backgroundColor: '#444', 
          borderRadius: '5px', boxShadow: '0 5px 5px rgba(0,0,0,0.2)'
        }}></div>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '10px' }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', margin: '0', letterSpacing: '2px' }}>Menu</h1>
          <p style={{ fontStyle: 'italic', color: '#666', marginTop: '-5px' }}>The Backyards Cafe</p>
          <div style={{ width: '50px', height: '2px', backgroundColor: '#2c2c2c', margin: '15px auto' }}></div>
        </div>

        {/* CATEGORIES & ITEMS */}
        {Object.keys(groupedMenu).map(category => (
          <div key={category} style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              fontFamily: '"Playfair Display", serif', 
              fontSize: '1.5rem', 
              borderBottom: '1px solid #ddd', 
              paddingBottom: '5px',
              marginBottom: '15px'
            }}>
              {category}
            </h3>

            {groupedMenu[category].map(item => {
               const qty = cart[item._id] || 0;
               return (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  
                  {/* Item Name & Desc */}
                  <div style={{ flex: 1, paddingRight: '10px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', fontFamily: '"Lato", sans-serif' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#777', fontStyle: 'italic' }}>{item.description}</div>
                  </div>

                  {/* Price & Add Button */}
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.price}</div>
                    
                    {qty === 0 ? (
                      <button onClick={() => addToCart(item._id)} style={{ fontSize:'0.8rem', background:'none', border:'1px solid #333', borderRadius:'15px', padding:'2px 8px', cursor:'pointer', marginTop:'5px' }}>ADD</button>
                    ) : (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', marginTop:'5px' }}>
                        <button onClick={() => removeFromCart(item._id)} style={{ background:'#333', color:'white', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer' }}>-</button>
                        <span style={{ margin:'0 5px', fontSize:'0.9rem' }}>{qty}</span>
                        <button onClick={() => addToCart(item._id)} style={{ background:'#333', color:'white', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer' }}>+</button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ))}

        {/* BOTTOM DECORATION */}
        <div style={{ textAlign: 'center', marginTop: '50px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
           <span style={{ fontSize: '24px' }}>🍴</span>
           <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>Fresh & Organic</p>
        </div>

      </div>

      {/* FLOATING CART BUTTON (Only if items added) */}
      {totalItems > 0 && (
        <button onClick={() => setIsCartOpen(true)} style={{
          position: 'fixed', bottom: '20px', right: '20px',
          backgroundColor: '#2c2c2c', color: 'white',
          border: 'none', borderRadius: '50px',
          padding: '15px 30px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
        }}>
          View Cart ({totalItems})
        </button>
      )}

      {/* FONTS LOADER */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>
    </div>
  );
}

export default OrderPage;