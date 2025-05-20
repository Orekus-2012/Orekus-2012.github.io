import React, { useEffect, useState, useContext, useCallback } from 'react';
import Modal from '../components/Modal'; // Ваш існуючий модальний компонент для бронювання (можна залишити або використовувати окремо)
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);
  const [tours, setTours] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // для бронювання
  const [activeTour, setActiveTour] = useState(null);
  const [bookedTours, setBookedTours] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);

  // Додаткові стани для відгуку
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [activeReviewTour, setActiveReviewTour] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Функція для отримання ключа з localStorage (для бронювань конкретного користувача)
  const getStorageKey = useCallback(() => {
    return currentUser ? `bookings_${currentUser.uid}` : null;
  }, [currentUser]);

  // Завантаження турів із Firestore
  useEffect(() => {
    async function fetchTours() {
      try {
        const toursCollectionRef = collection(db, "Tours");
        const snapshot = await getDocs(toursCollectionRef);
        const toursData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTours(toursData);
      } catch (error) {
        console.error('Помилка завантаження турів з Firestore:', error);
      }
    }
    fetchTours();
  }, []);

  // Завантаження бронювань із localStorage для поточного користувача
  useEffect(() => {
    if (currentUser) {
      const storageKey = getStorageKey();
      const storedBookings = JSON.parse(localStorage.getItem(storageKey)) || [];
      setBookedTours(storedBookings);
    } else {
      setBookedTours([]);
    }
  }, [currentUser, getStorageKey]);

  // Функція бронювання туру
  const handleBook = (tour) => {
    if (!currentUser) {
      // Якщо користувач не залогінений, нічого не робимо (кнопка буде розблокована)
      return;
    }
    const alreadyBooked = bookedTours.find(
      b => b.destination === tour.destination && b.userId === currentUser.uid
    );
    if (alreadyBooked) return;
    setActiveTour(tour);
    setModalVisible(true);
  };

  const handleConfirm = (date) => {
    if (!currentUser) return;
    const booking = { ...activeTour, date, userId: currentUser.uid };
    const updatedBookings = [...bookedTours, booking];
    setBookedTours(updatedBookings);
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(updatedBookings));
    setModalVisible(false);
    setActiveTour(null);
  };

  const handleCancelModal = () => {
    setModalVisible(false);
    setActiveTour(null);
  };

  // Функція для відкриття модального вікна відгуку
  const handleLeaveReview = (tour) => {
    if (!currentUser) {
      alert("Будь ласка, увійдіть, щоб залишити відгук");
      return;
    }
    setActiveReviewTour(tour);
    setReviewModalVisible(true);
  };

  // Функція, що викликається після підтвердження відгуку
  const handleConfirmReview = async () => {
    if (!currentUser || !activeReviewTour) return;
    // Формуємо об'єкт відгуку
    const review = {
      tourName: activeReviewTour.destination,           // Назва туру з даних туру
      reviewerName: currentUser.email,                    // Емейл користувача
      createdAt: new Date(),                              // Поточна дата
      rating: reviewRating,
      reviewText: reviewText
    };

    try {
      // Зберігаємо відгук у Firestore (колекція "Review")
      const docRef = await addDoc(collection(db, "Review"), review);
      console.log("Відгук збережено з ID: ", docRef.id);
      // Очищення і закриття модального вікна відгуку
      setReviewModalVisible(false);
      setActiveReviewTour(null);
      setReviewRating(0);
      setReviewText("");
    } catch (error) {
      console.error("Помилка при збереженні відгуку: ", error);
    }
  };

  const handleSortByPrice = () => {
    const sortedTours = [...tours].sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return sortAsc ? priceA - priceB : priceB - priceA;
    });
    setTours(sortedTours);
    setSortAsc(!sortAsc);
  };

  return (
    <section id="tour-list">
      <h2>Гарячі тури</h2>
      <button onClick={handleSortByPrice}>
         {sortAsc
            ? 'Сортувати за зростанням ціни'
            : 'Сортувати за зменшенням ціни'
         }
      </button>
      <div className="tour-list">
        {tours.map((tour, index) => {
          const alreadyBooked =
            currentUser &&
            bookedTours.find(b => b.destination === tour.destination && b.userId === currentUser.uid);
          return (
            <div className={`tour-card ${tour.highlight ? 'highlight' : ''}`} key={index}>
              <img src={`${process.env.PUBLIC_URL}/Tours${tour.image}`} alt={tour.destination} />
              <h3>{tour.destination}</h3>
              <p>Тривалість: {tour.duration}</p>
              <p>Ціна: {tour.price}</p>
              
              {/* Кнопка для залишення відгуку */}
              <button 
                className="leave-review" 
                onClick={() => handleLeaveReview(tour)}
                style={{ marginBottom: '10px' }}
              >
                Залишити відгук
              </button>
              
              {/* Кнопка бронювання */}
              <button
                className={`book-now${alreadyBooked ? ' booked' : ''}`}
                onClick={() => handleBook(tour)}
                disabled={!currentUser || !!alreadyBooked}
              >
                { !currentUser 
                  ? 'Зареєструйтеся' 
                  : (alreadyBooked ? 'Заброньовано' : 'Забронювати') }
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Модальне вікно для бронювання (існуюча реалізація) */}
      {modalVisible && (
        <Modal 
          visible={modalVisible} 
          onConfirm={handleConfirm} 
          onCancel={handleCancelModal}
        />
      )}

      {/* Модальне вікно для залишення відгуку */}
      {reviewModalVisible && (
        <div className="review-modal-overlay">
          <div className="review-modal-content">
            <h3>
              Залиште відгук для туру: {activeReviewTour && activeReviewTour.destination}
            </h3>
            <div className="review-rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  onClick={() => setReviewRating(i + 1)}
                  className={i < reviewRating ? "filled" : ""}
                >
                  &#9733;
                </span>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Ваш відгук..."
              rows="4"
            />
            <div className="review-modal-buttons">
              <button onClick={handleConfirmReview}>Відправити відгук</button>
              <button onClick={() => setReviewModalVisible(false)}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default HomePage;
