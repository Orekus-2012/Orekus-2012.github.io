import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '../context/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const BookingsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const mapRef = useRef(null);

  // Мемоізована функція для формування ключа з localStorage
  const getStorageKey = useCallback(() => {
    return currentUser ? `bookings_${currentUser.uid}` : null;
  }, [currentUser]);

  // Завантаження бронювань для поточного користувача
  useEffect(() => {
    if (currentUser) {
      const storageKey = getStorageKey();
      const storedBookings = JSON.parse(localStorage.getItem(storageKey)) || [];
      setBookings(storedBookings);
    } else {
      setBookings([]);
    }
  }, [currentUser, getStorageKey]);

  // Ініціалізація карти Leaflet. Якщо користувач не увійшов або елемент "leaflet-map" відсутній – нічого не робимо.
  useEffect(() => {
    if (!currentUser) return; 
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;
    if (!mapRef.current) {
      mapRef.current = L.map('leaflet-map').setView([50.4501, 30.5234], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      fetch('/places.json')
        .then(response => response.json())
        .then(places => {
          places.forEach(place => {
            const marker = L.marker(place.coords).addTo(mapRef.current);
            marker.bindPopup(`<b>${place.name}</b><br>${place.description}`);
          });
        })
        .catch(error => console.error('Помилка завантаження даних для мапи:', error));
    }
  }, [currentUser]);

  const handleCancelBooking = (bookingToCancel) => {
    const updatedBookings = bookings.filter(
      booking =>
        booking.destination !== bookingToCancel.destination ||
        booking.date !== bookingToCancel.date
    );
    setBookings(updatedBookings);
    
    const storageKey = getStorageKey();
    const storedAll = JSON.parse(localStorage.getItem(storageKey)) || [];
    const updatedAllBookings = storedAll.filter(
      booking =>
        booking.destination !== bookingToCancel.destination ||
        booking.date !== bookingToCancel.date ||
        booking.userId !== bookingToCancel.userId
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedAllBookings));
  };

  // Якщо користувач не авторизований, просто показуємо повідомлення
  if (!currentUser) {
    return (
      <main>
        <h2>Мої бронювання</h2>
        <p>Будь ласка, зареєструйтеся, щоб переглянути свої бронювання.</p>
      </main>
    );
  }

  return (
    <main>
      <h2>Мої бронювання</h2>
      <div className="table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Назва туру</th>
              <th>Тривалість</th>
              <th>Дата</th>
              <th>Ціна</th>
              <th>Скасування туру</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index}>
                <td>{booking.destination}</td>
                <td>{booking.duration}</td>
                <td>{booking.date}</td>
                <td>{booking.price}</td>
                <td>
                  <button 
                    className="cancel-btn" 
                    onClick={() => handleCancelBooking(booking)}
                  >
                    Скасувати
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section>
        <h3>Популярні туристичні місця</h3>
        <div id="leaflet-map" style={{ height: '500px', width: '100%' }}></div>
      </section>
    </main>
  );
};

export default BookingsPage;
