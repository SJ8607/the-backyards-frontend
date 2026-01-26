import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ⚠️ CHANGE THIS TO YOUR REAL UPI ID (e.g., "9876543210@paytm")
const RESTAURANT_UPI_ID = "jadhavshambhooraje@okicici"; 
const RESTAURANT_NAME = "The Backyards Cafe";

function OrderPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableNumber = queryParams.get('table');

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // --- PAYMENT STATES ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // summary -> methods -> qr_code -> processing
  const [selectedMethod, setSelectedMethod] = useState(null);

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

  // --- HELPER: GROUP ITEMS ---
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

  // --- PAYMENT FLOW ---
  const handlePayNowClick = () => {
    setPaymentStep('summary');
    setShowPaymentModal(true);
  };

  const handleConfirmSummary = () => {
    setPaymentStep('methods');
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (method === 'UPI') {
      setPaymentStep('qr_code'); // Show QR for UPI
    } else {
      // For Cash/Card, go straight to processing
      handleFinalizeOrder(method);
    }
  };

  const handleFinalizeOrder = async (method) => {
    setPaymentStep('processing');
    
    // Simulate Network Delay
    setTimeout(async () => {
      await sendOrderToBackend(method);
      setShowPaymentModal(false);
    }, 2000);
  };

  const sendOrderToBackend = async (method) => {
    const orderDetails = { 
        tableNumber, 
        items: cart, 
        totalAmount: totalPrice,
        paymentMethod: method 
    };

    try {
      const response = await fetch('https://the-backyards-api.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Order Sent to Kitchen! Order ID: ${data.orderId}`);
        setCart({});
        setIsCartOpen(false);
      } else {
        alert("❌ Order Failed. Please try again.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    }
  };

  // --- UPI QR GENERATOR URL ---
  const getUPIQRUrl = () => {
    // This creates a standard UPI link string
    const upiString = `upi://pay?pa=${RESTAURANT_UPI_ID}&pn=${RESTAURANT_NAME}&am=${totalPrice}&cu=INR`;
    // We encode it to generate a QR image
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
  };

  if (loading) return <div style={{ padding:'50px', textAlign:'center', color:'#8B5A2B' }}>Loading Menu...</div>;

  // --- CART SCREEN ---
  if (isCartOpen) {
    return (
      <div style={{ padding: '20px', fontFamily: '"Lato", sans-serif' }}>
        <button onClick={() => setIsCartOpen(false)} style={{ marginBottom: '20px', padding: '10px', background:'none', border:'1px solid #333' }}>&larr; Back to Menu</button>
        <h2 style={{ color:'#8B5A2B', fontFamily: '"Playfair Display", serif' }}>Your Order (Table {tableNumber})</h2>
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
        
        <button onClick={handlePayNowClick} style={{ width: '100%', padding: '15px', backgroundColor: '#8B5A2B', color: 'white', border: 'none', fontSize: '18px', marginTop: '20px', borderRadius:'5px' }}>
          PAY ₹{totalPrice} NOW
        </button>
        
        {/* --- MULTI-STEP PAYMENT MODAL --- */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', width: '320px', textAlign: 'center', position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
              
              {/* Close Button */}
              {paymentStep !== 'processing' && (
                <button onClick={() => setShowPaymentModal(false)} style={{ position:'absolute', top:'10px', right:'15px', background:'none', border:'none', fontSize:'20px', cursor:'pointer' }}>✖</button>
              )}

              {/* STEP 1: SUMMARY */}
              {paymentStep === 'summary' && (
                <div>
                  <h3 style={{marginTop:0}}>Bill Summary</h3>
                  <div style={{ margin: '20px 0', fontSize:'18px', color:'#555' }}>
                    Total to Pay: <br/>
                    <strong style={{ fontSize:'32px', color:'#000' }}>₹{totalPrice}</strong>
                  </div>
                  <button onClick={handleConfirmSummary} style={{ width:'100%', padding:'12px', backgroundColor:'#28a745', color:'white', border:'none', borderRadius:'5px', fontSize:'16px' }}>
                    Confirm & Select Payment &rarr;
                  </button>
                </div>
              )}

              {/* STEP 2: PAYMENT METHODS */}
              {paymentStep === 'methods' && (
                <div>
                  <h3 style={{marginTop:0}}>Select Payment Mode</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px', margin:'20px 0' }}>
                    <button onClick={() => handleMethodSelect('UPI')} style={{ padding:'12px', border: '1px solid #ddd', backgroundColor: '#fdf3e8', borderRadius:'8px', textAlign:'left', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px' }}>
                       📱 Pay via QR / UPI
                    </button>
                    <button onClick={() => handleMethodSelect('Cash')} style={{ padding:'12px', border: '1px solid #ddd', backgroundColor: 'white', borderRadius:'8px', textAlign:'left', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px' }}>
                       💵 Cash on Table
                    </button>
                    <button onClick={() => handleMethodSelect('Card')} style={{ padding:'12px', border: '1px solid #ddd', backgroundColor: 'white', borderRadius:'8px', textAlign:'left', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px' }}>
                       💳 Card Payment
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: QR CODE (UPI) */}
              {paymentStep === 'qr_code' && (
                <div>
                  <h3 style={{marginTop:0, marginBottom:'5px'}}>Scan to Pay</h3>
                  <p style={{fontSize:'14px', color:'#555', margin:0}}>Use GPay, PhonePe, or Paytm</p>
                  
                  {/* DYNAMIC QR CODE */}
                  <div style={{ margin: '15px auto', padding:'10px', border:'2px dashed #8B5A2B', borderRadius:'10px', display:'inline-block' }}>
                     <img src={getUPIQRUrl()} alt="UPI QR" style={{ width:'100%', maxWidth:'200px', display:'block' }} />
                  </div>

                  <div style={{ fontSize:'20px', fontWeight:'bold', marginBottom:'15px' }}>₹{totalPrice}</div>

                  <button onClick={() => handleFinalizeOrder('UPI')} style={{ width:'100%', padding:'12px', backgroundColor:'#28a745', color:'white', border:'none', borderRadius:'5px', fontSize:'16px' }}>
                    ✅ I Have Made the Payment
                  </button>
                  
                  <button onClick={() => setPaymentStep('methods')} style={{ marginTop:'10px', background:'none', border:'none', color:'#666', fontSize:'13px', textDecoration:'underline' }}>
                    Choose different method
                  </button>
                </div>
              )}

              {/* STEP 4: PROCESSING */}
              {paymentStep === 'processing' && (
                <div>
                  <div style={{ fontSize:'40px', marginBottom:'10px' }}>🍽️</div>
                  <h3>Sending Order...</h3>
                  <p>Kitchen is receiving your request.</p>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    );
  }

  // --- THE MENU UI (Same as before) ---
  return (
    <div style={{ 
      backgroundColor: '#fff', minHeight: '100vh', position: 'relative', overflowX: 'hidden', color: '#4a4a4a', fontFamily: '"Lato", sans-serif'
    }}>
      <img src="https://cdn-icons-png.flaticon.com/512/740/740878.png" alt="leaf-left" style={{ position:'absolute', top:'-50px', left:'-50px', width:'200px', opacity:0.8, transform:'rotate(45deg)', pointerEvents:'none' }} />
      <img src="https://cdn-icons-png.flaticon.com/512/740/740878.png" alt="leaf-right" style={{ position:'absolute', top:'-20px', right:'-60px', width:'250px', opacity:0.8, transform:'rotate(-45deg) scaleX(-1)', pointerEvents:'none' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '40px' }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', color: '#8B5A2B', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Menu</h1>
          <p style={{ color: '#8B5A2B', fontStyle: 'italic', marginTop: '5px' }}>The Backyards Cafe</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {Object.keys(groupedMenu).map((category) => (
            <div key={category} style={{ width: '100%', marginBottom: '40px' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', color: '#8B5A2B', fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '20px', borderBottom: '2px solid #f0e6dd', display: 'inline-block', paddingBottom: '5px' }}>{category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'x 40px' }}>
                {groupedMenu[category].map(item => {
                   const qty = cart[item._id] || 0;
                   return (
                    <div key={item._id} style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#5d4037' }}>{item.name}</span>
                        <span style={{ flex: 1, borderBottom: '1px dotted #ccc', margin: '0 10px', position: 'relative', top: '-5px' }}></span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#5d4037' }}>{item.price}/-</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic', maxWidth: '80%' }}>{item.description}</span>
                        {qty === 0 ? (
                          <button onClick={() => addToCart(item._id)} style={{ fontSize:'0.75rem', background:'white', color:'#8B5A2B', border:'1px solid #8B5A2B', borderRadius:'15px', padding:'2px 8px', cursor:'pointer' }}>ADD</button>
                        ) : (
                          <div style={{ display:'flex', alignItems:'center', background:'#8B5A2B', borderRadius:'15px', padding:'0 5px' }}>
                            <button onClick={() => removeFromCart(item._id)} style={{ background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'0.9rem' }}>-</button>
                            <span style={{ margin:'0 5px', fontSize:'0.8rem', color:'white' }}>{qty}</span>
                            <button onClick={() => addToCart(item._id)} style={{ background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'0.9rem' }}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalItems > 0 && (
        <button onClick={() => setIsCartOpen(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#8B5A2B', color: 'white', border: 'none', borderRadius: '50px', padding: '15px 30px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', zIndex: 100 }}>
          View Order ({totalItems})
        </button>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
    </div>
  );
}

export default OrderPage;