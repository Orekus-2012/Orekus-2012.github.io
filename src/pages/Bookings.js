import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const BookingsPage = () => {
  const [bookings, setBookings] = useState(() =>
    JSON.parse(localStorage.getItem('bookings')) || []
  );
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('leaflet-map').setView([50.4501, 30.5234], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Завантаження даних для мапи
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
  }, []);

  const handleCancelBooking = (bookingToCancel) => {
    const updatedBookings = bookings.filter(
      booking =>
        booking.destination !== bookingToCancel.destination ||
        booking.date !== bookingToCancel.date
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

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
