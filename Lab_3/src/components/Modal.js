import React, { useState } from 'react';

const Modal = ({ visible, onConfirm, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState('');

  if (!visible) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Виберіть дату для туру</h3>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={() => {
          if (!selectedDate) {
            alert('Будь ласка, виберіть дату!');
            return;
          }
          onConfirm(selectedDate);
          setSelectedDate('');
        }}>
          Підтвердити
        </button>
        <button onClick={() => {
          onCancel();
          setSelectedDate('');
        }}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default Modal;
