import React, { useState, useEffect } from 'react';

function Admin() {
  const [menuItems, setMenuItems] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Food');
  const [desc, setDesc] = useState('');

  // 1. Fetch current menu from Backend
  const fetchMenu = async () => {
    try {
      // Make sure this URL matches your deployed backend!
      const response = await fetch('https://the-backyards-api.onrender.com/api/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // 2. Add New Item Function
  const handleAddItem = async (e) => {
    e.preventDefault(); // Stop page refresh
    
    const newItem = { name, price: Number(price), category, description: desc };

    try {
      const response = await fetch('https://the-backyards-api.onrender.com/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        alert("Item Added!");
        setName(''); setPrice(''); setDesc(''); // Clear form
        fetchMenu(); // Refresh list
      }
    } catch (error) {
      alert("Error adding item");
    }
  };

  // 3. Delete Item Function
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await fetch(`https://the-backyards-api.onrender.com/api/menu/${id}`, {
        method: 'DELETE'
      });
      fetchMenu(); // Refresh list
    } catch (error) {
      alert("Error deleting item");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ Menu Manager</h1>
      
      {/* ADD ITEM FORM */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h3>Add New Item</h3>
        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" placeholder="Item Name (e.g. Burger)" required 
            value={name} onChange={e => setName(e.target.value)}
            style={{ padding: '10px' }}
          />
          <input 
            type="number" placeholder="Price (e.g. 149)" required 
            value={price} onChange={e => setPrice(e.target.value)}
            style={{ padding: '10px' }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px' }}>
            <option value="Food">Food</option>
            <option value="Drinks">Drinks</option>
          </select>
          <input 
            type="text" placeholder="Description (e.g. Spicy and crunchy)" required 
            value={desc} onChange={e => setDesc(e.target.value)}
            style={{ padding: '10px' }}
          />
          <button type="submit" style={{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
            ADD TO MENU
          </button>
        </form>
      </div>

      {/* CURRENT MENU LIST */}
      <h3>Current Menu Items</h3>
      {menuItems.map(item => (
        <div key={item._id} style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          borderBottom: '1px solid #ddd', padding: '10px 0' 
        }}>
          <div>
            <strong>{item.name}</strong> - ₹{item.price} <br/>
            <span style={{ color: '#666', fontSize: '12px' }}>{item.description}</span>
          </div>
          <button 
            onClick={() => handleDelete(item._id)}
            style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Admin;