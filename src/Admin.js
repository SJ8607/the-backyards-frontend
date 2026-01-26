import React, { useState, useEffect } from 'react';

// --- DATA FROM YOUR MENU IMAGE ---
const BULK_MENU_DATA = [
  // ... (Keep the data same as before, no need to change this part) ...
  { name: "Masala Maggie", price: 80, category: "MAGGIE", description: "Classic spicy maggie" },
  { name: "Cheese Corn Maggie", price: 95, category: "MAGGIE", description: "Loaded with cheese and corn" },
  { name: "Cheese Peri-Peri Maggie", price: 95, category: "MAGGIE", description: "Spicy peri-peri flavor with cheese" },
  { name: "Chicken Cheese Maggie", price: 140, category: "MAGGIE", description: "Non-veg delight with cheese" },
  { name: "Veggie Cheese Maggie", price: 130, category: "MAGGIE", description: "Loaded with vegetables and cheese" },
  { name: "Veg White Sauce Pasta", price: 180, category: "PASTA", description: "Creamy white sauce pasta with veggies" },
  { name: "Chicken White Sauce Pasta", price: 220, category: "PASTA", description: "Creamy white sauce pasta with chicken" },
  { name: "Paneer Tandoor Sandwich", price: 120, category: "SANDWICHES", description: "Grilled sandwich with tandoori paneer" },
  { name: "Veg Sandwich", price: 90, category: "SANDWICHES", description: "Classic vegetable sandwich" },
  { name: "Bombay Masala Sandwich", price: 120, category: "SANDWICHES", description: "Spicy Bombay style filling" },
  { name: "Chicken Sandwich", price: 140, category: "SANDWICHES", description: "Loaded with juicy chicken" },
  { name: "Chocolate Sandwich", price: 130, category: "SANDWICHES", description: "Sweet treat with chocolate filling" },
  { name: "Veg Club Sandwich", price: 110, category: "SANDWICHES", description: "Double decker veggie sandwich" },
  { name: "Cranberry Mojito", price: 90, category: "MOCKTAILS & MOJITOS", description: "Refreshing cranberry cooler" },
  { name: "Virgin Mojito", price: 90, category: "MOCKTAILS & MOJITOS", description: "Classic mint and lemon cooler" },
  { name: "Blue Lagoon", price: 90, category: "MOCKTAILS & MOJITOS", description: "Blue curacao refreshing drink" },
  { name: "Raspberry", price: 90, category: "MOCKTAILS & MOJITOS", description: "Sweet raspberry flavored drink" },
  { name: "Firey Guava", price: 110, category: "MOCKTAILS & MOJITOS", description: "Spicy guava drink" },
  { name: "Cosmopolitan", price: 130, category: "MOCKTAILS & MOJITOS", description: "Classic non-alcoholic cosmo" },
  { name: "Coffee", price: 30, category: "HOT BEVERAGES", description: "Hot brewed coffee" },
  { name: "Hot Chocolate", price: 85, category: "HOT BEVERAGES", description: "Rich hot chocolate" },
  { name: "Lemon Tea", price: 40, category: "HOT BEVERAGES", description: "Refreshing hot lemon tea" },
  { name: "Salty Fries", price: 90, category: "FRIES", description: "Classic salted french fries" },
  { name: "Peri-Peri Fries", price: 110, category: "FRIES", description: "Spicy peri-peri dusted fries" },
  { name: "Cheese Fries", price: 130, category: "FRIES", description: "Fries topped with melted cheese" },
  { name: "Cheese Peri-Peri Fries", price: 160, category: "FRIES", description: "Cheese fries with a spicy kick" },
  { name: "Omelette", price: 80, category: "EGGS", description: "Classic egg omelette" },
  { name: "Cheese Omelette", price: 110, category: "EGGS", description: "Fluffy omelette with cheese" },
  { name: "Chicken Omelette", price: 170, category: "EGGS", description: "Omelette stuffed with chicken" },
  { name: "Aussie Egg Fry", price: 160, category: "EGGS", description: "Australian style fried eggs" },
  { name: "Anda Ghotala", price: 140, category: "EGGS", description: "Spicy egg mix" },
  { name: "Burnt Garlic Rice", price: 170, category: "CHINESE", description: "Flavorful garlic fried rice" },
  { name: "Chicken Burnt Garlic Rice", price: 240, category: "CHINESE", description: "Garlic fried rice with chicken" },
  { name: "Veg Thai Fried Rice", price: 190, category: "CHINESE", description: "Thai style vegetable rice" },
  { name: "Chicken Thai Fried Rice", price: 260, category: "CHINESE", description: "Thai style chicken rice" },
  { name: "Dragon Fruit Shake", price: 110, category: "SHAKES", description: "Exotic dragon fruit milkshake" },
  { name: "Banana Nutella Shake", price: 95, category: "SHAKES", description: "Rich blend of banana and nutella" },
  { name: "Chicken Chilly", price: 225, category: "STARTERS", description: "Spicy indo-chinese chicken" },
  { name: "Paneer Chilly", price: 190, category: "STARTERS", description: "Spicy indo-chinese paneer" },
  { name: "Chicken Fingers", price: 210, category: "STARTERS", description: "Crispy fried chicken strips" },
  { name: "Cheese Corn Fingers", price: 175, category: "STARTERS", description: "Crispy corn and cheese sticks" },
  { name: "Creamy Chicken Peri-Peri", price: 240, category: "STARTERS", description: "Creamy spicy chicken starter" },
  { name: "Creamy Mushroom Peri-Peri", price: 190, category: "STARTERS", description: "Creamy spicy mushroom starter" }
];

function Admin() {
  const [menuItems, setMenuItems] = useState([]);
  
  // QR Code State
  const [appUrl, setAppUrl] = useState('');
  const [qrTable, setQrTable] = useState('1');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('MAGGIE');
  const [desc, setDesc] = useState('');

  const API_URL = 'https://the-backyards-api.onrender.com/api/menu';

  // 1. Fetch current menu
  const fetchMenu = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // 2. Add New Item (Manual)
  const handleAddItem = async (e) => {
    e.preventDefault();
    const newItem = { name, price: Number(price), category, description: desc };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        alert("Item Added!");
        setName(''); setPrice(''); setDesc(''); 
        fetchMenu();
      }
    } catch (error) {
      alert("Error adding item");
    }
  };

  // 3. Delete Item
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchMenu();
    } catch (error) {
      alert("Error deleting item");
    }
  };

  // 4. BULK UPLOAD FUNCTION
  const handleBulkUpload = async () => {
    if(!window.confirm(`This will add ${BULK_MENU_DATA.length} items to your menu. Continue?`)) return;
    
    let count = 0;
    for (const item of BULK_MENU_DATA) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        count++;
        console.log(`Added ${item.name}`);
      } catch (e) {
        console.error("Failed to add", item.name);
      }
    }
    alert(`Successfully added ${count} items!`);
    fetchMenu();
  };

  // --- SMART URL CLEANER ---
  const getCleanUrl = () => {
    if (!appUrl) return "";
    // Remove anything after the domain (like /order?table=1) to prevent duplication
    let clean = appUrl.split('/order')[0];
    // Remove trailing slash
    if (clean.endsWith('/')) clean = clean.slice(0, -1);
    return clean;
  };
  
  const finalQrLink = `${getCleanUrl()}/order?table=${qrTable}`;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ Admin Dashboard</h1>

      {/* --- NEW: QR CODE GENERATOR --- */}
      <div style={{ backgroundColor: '#222', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
        <h2>🖨️ QR Code Generator</h2>
        <p style={{ color: '#ccc', fontSize: '14px' }}>Generate printable QR codes for your tables.</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Paste your Vercel Link (e.g., https://the-backyards-frontend.vercel.app)" 
            value={appUrl} 
            onChange={(e) => setAppUrl(e.target.value)} 
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none' }}
          />
          <input 
            type="number" 
            placeholder="Table No" 
            value={qrTable} 
            onChange={(e) => setQrTable(e.target.value)} 
            style={{ width: '80px', padding: '10px', borderRadius: '5px', border: 'none' }}
          />
        </div>

        {appUrl && (
          <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
            <h3 style={{ color: 'black', margin: '0 0 10px 0' }}>Table {qrTable}</h3>
            
            {/* The QR Code Image */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${finalQrLink}`} 
              alt={`QR for Table ${qrTable}`} 
              style={{ border: '1px solid #ddd' }}
            />
            
            <p style={{ color: 'black', fontSize: '12px', marginTop: '10px' }}>
              <strong>Link generated:</strong> <br/>
              <span style={{color:'blue'}}>{finalQrLink}</span>
            </p>
            <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>
              *If this link gives a 404 error, your Vercel URL is wrong!
            </p>
          </div>
        )}
      </div>

      
      {/* BULK UPLOAD SECTION */}
      <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #2196f3', textAlign:'center' }}>
        <h3>🚀 Menu Manager</h3>
        <p>Missing items? Upload the default menu again.</p>
        <button 
          onClick={handleBulkUpload}
          style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: 'white', border: 'none', cursor: 'pointer', fontWeight:'bold', borderRadius:'5px' }}>
          Re-Upload Default Menu
        </button>
      </div>

      {/* MANUAL ADD FORM */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h3>Add Single Item</h3>
        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px' }} />
          <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '10px' }} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px' }}>
            <option value="MAGGIE">MAGGIE</option>
            <option value="PASTA">PASTA</option>
            <option value="SANDWICHES">SANDWICHES</option>
            <option value="MOCKTAILS & MOJITOS">MOCKTAILS & MOJITOS</option>
            <option value="HOT BEVERAGES">HOT BEVERAGES</option>
            <option value="FRIES">FRIES</option>
            <option value="EGGS">EGGS</option>
            <option value="CHINESE">CHINESE</option>
            <option value="SHAKES">SHAKES</option>
            <option value="STARTERS">STARTERS</option>
            <option value="OTHERS">OTHERS</option>
          </select>
          <input type="text" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>ADD ITEM</button>
        </form>
      </div>

      {/* CURRENT MENU LIST */}
      <h3>Current Menu Items ({menuItems.length})</h3>
      {menuItems.map(item => (
        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', padding: '10px 0' }}>
          <div>
            <strong>{item.name}</strong> - ₹{item.price} <br/>
            <span style={{ color: '#666', fontSize: '12px' }}>{item.category}</span>
          </div>
          <button onClick={() => handleDelete(item._id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Admin;