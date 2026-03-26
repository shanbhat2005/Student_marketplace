import React, { useState } from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address so we can send your confirmation receipt.");
      return;
    }
    onConfirm(email);
    setEmail('');
  };

  const handleCancel = () => {
    setEmail('');
    onCancel();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '8px',
        maxWidth: '430px', width: '90%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#1f2937' }}>{title}</h3>
        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>{message}</p>
        
        <input 
          type="email" 
          placeholder="Where should we send your receipt?"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            width: '90%', padding: '0.75rem', marginBottom: '1.5rem', 
            borderRadius: '4px', border: '1px solid #d1d5db',
            fontSize: '1rem', boxSizing: 'border-box'
          }}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button 
            onClick={handleCancel}
            style={{ padding: '0.5rem 1rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
