import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTour, setActiveTour] = useState(null);
  const [bookedTours, setBookedTours] = useState(() =>
    JSON.parse(localStorage.getItem('bookings')) || []
  );


  useEffect(() => {
    fetch('/tours.json')
      .then(response => response.json())
      .then(data => {
        setTours(data);
      })
      .catch(error => console.error('Помилка завантаження турів:', error));
  }, []);

  const handleBook = (tour) => {
    const alreadyBooked = bookedTours.find(b => b.destination === tour.destination);
    if (alreadyBooked) return;
    setActiveTour(tour);
    setModalVisible(true);
  };

  const handleConfirm = (date) => {
    const booking = { ...activeTour, date };
    const updatedBookings = [...bookedTours, booking];
    setBookedTours(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    setModalVisible(false);
    setActiveTour(null);
  };

  const handleCancelModal = () => {
    setModalVisible(false);
    setActiveTour(null);
  };

  const handleSortByPrice = () => {
    const sortedTours = [...tours].sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return priceA - priceB;
    });
    setTours(sortedTours);
  };

  return (
    <section id="tour-list">
      <h2>Гарячі тури</h2>
      <button onClick={handleSortByPrice}>
        Сортувати за ціною (від дешевших до дорожчих)
      </button>
      <div className="tour-list">
        {tours.map((tour, index) => {
          const alreadyBooked = bookedTours.find(b => b.destination === tour.destination);
          return (
            <div className={`tour-card ${tour.highlight ? 'highlight' : ''}`} key={index}>
              <img src={`${process.env.PUBLIC_URL}/Tours${tour.image}`} alt={tour.destination} />
              <h3>{tour.destination}</h3>
              <p>Тривалість: {tour.duration}</p>
              <p>Ціна: {tour.price}</p>
              <button 
                className="book-now" 
                onClick={() => handleBook(tour)}
                disabled={!!alreadyBooked}
                style={alreadyBooked ? { backgroundColor: 'green', color: 'white' } : {}}
              >
                {alreadyBooked ? 'Заброньовано' : 'Забронювати'}
              </button>
            </div>
          );
        })}
      </div>
      <Modal 
        visible={modalVisible} 
        onConfirm={handleConfirm} 
        onCancel={handleCancelModal}
      />
    </section>
  );
};

export default HomePage;