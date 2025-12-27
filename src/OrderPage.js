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
  
  // NEW: Payment State
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

  // --- NEW: SIMULATE PAYMENT ---
  const handlePaymentStart = () => {
    setShowPaymentModal(true); // Open the fake payment popup
  };

  const confirmPayment = async () => {
    setIsProcessingPayment(true);
    
    // Fake a 2-second delay for "Connecting to Bank..."
    setTimeout(async () => {
      await sendOrderToBackend();
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }, 2000);
  };

  // --- SEND ORDER TO BACKEND ---
  const sendOrderToBackend = async () => {
    const orderDetails = {
      tableNumber: tableNumber,
      items: cart,
      totalAmount: totalPrice
    };

    try {
      const response = await fetch('https://the-backyards-api.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Payment Successful! \nOrder ID: ${data.orderId} \nKitchen has received your order.`);
        setCart({});
        setIsCartOpen(false);
      } else {
        alert("❌ Order Failed. Please try again.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    }
  };

  // --- RENDER ---
  if (isCartOpen) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <button onClick={() => setIsCartOpen(false)} style={{ marginBottom: '20px', padding: '10px' }}>&larr; Back</button>
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
        <hr />
        <h3>Total: ₹{totalPrice}</h3>

        {/* PAY BUTTON */}
        <button 
          onClick={handlePaymentStart}
          style={{ width: '100%', padding: '15px', backgroundColor: 'black', color: 'white', border: 'none', fontSize: '18px', marginTop: '20px' }}>
          PAY ₹{totalPrice} NOW
        </button>

        {/* --- FAKE PAYMENT POPUP --- */}
        {showPaymentModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', width: '300px' }}>
              {isProcessingPayment ? (
                <div>
                  <div className="spinner" style={{ width:'40px', height:'40px', border:'5px solid #f3f3f3', borderTop:'5px solid #3498db', borderRadius:'50%', margin:'0 auto 20px auto', animation:'spin 1s linear infinite' }}></div>
                  <h3>Processing...</h3>
                  <p>Contacting Bank...</p>
                </div>
              ) : (
                <div>
                  <h3>Secure Payment</h3>
                  <p>Total Amount: <strong>₹{totalPrice}</strong></p>
                  <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'20px' }}>
                    <button style={{ padding:'10px', background:'#eee', border:'1px solid #ccc' }}>UPI</button>
                    <button style={{ padding:'10px', background:'#eee', border:'1px solid #ccc' }}>Card</button>
                    <button style={{ padding:'10px', background:'#eee', border:'1px solid #ccc' }}>Cash</button>
                  </div>
                  <button 
                    onClick={confirmPayment}
                    style={{ width:'100%', padding:'10px', backgroundColor:'#28a745', color:'white', border:'none', fontSize:'16px' }}>
                    CONFIRM PAYMENT
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    style={{ marginTop:'10px', background:'none', border:'none', color:'red', textDecoration:'underline', cursor:'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) return <div style={{ padding:'50px', textAlign:'center' }}>Loading Menu...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', paddingBottom: '80px' }}>
      <div style={{ backgroundColor: '#333', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>The Backyards 🌿</h1>
        <p>Table: <strong>{tableNumber}</strong></p>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {menuItems.map((item) => {
          const qty = cart[item._id] || 0;
          return (
            <div key={item._id} style={{ borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{item.name}</strong><br/>
                <span style={{ color: '#666', fontSize: '14px' }}>{item.description}</span><br/>
                <span style={{ fontWeight: 'bold' }}>₹{item.price}</span>
              </div>
              <div>
                {qty === 0 ? (
                  <button onClick={() => addToCart(item._id)} style={{ border: '1px solid green', color: 'green', background: 'white', padding: '5px 15px' }}>ADD</button>
                ) : (
                  <div style={{ background: 'green', color: 'white', borderRadius: '5px', display:'flex' }}>
                    <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: 'white', padding: '5px 10px' }}>-</button>
                    <span style={{ padding: '5px' }}>{qty}</span>
                    <button onClick={() => addToCart(item._id)} style={{ background: 'none', border: 'none', color: 'white', padding: '5px 10px' }}>+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalItems > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'green', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{totalItems} Items | ₹{totalPrice}</span>
          <button onClick={() => setIsCartOpen(true)} style={{ background: 'white', color: 'green', border: 'none', padding: '5px 15px', fontWeight:'bold' }}>VIEW CART</button>
        </div>
      )}
      
      {/* CSS for Spinner */}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default OrderPage;