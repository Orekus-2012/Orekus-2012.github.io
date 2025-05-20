import React, { useEffect, useState, useContext, useCallback } from 'react';
import Modal from '../components/Modal';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Стани для турів, бронювань та сортування
  const [tours, setTours] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // для бронювання
  const [activeTour, setActiveTour] = useState(null);
  const [bookedTours, setBookedTours] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);

  // Стани для залишення відгуку
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [activeReviewTour, setActiveReviewTour] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Стани для перегляду відгуків (окреме модальне вікно)
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [reviewsForTour, setReviewsForTour] = useState([]);
  const [reviewsAverage, setReviewsAverage] = useState(0);
  const [activeReviewsTour, setActiveReviewsTour] = useState(null);

  // Функція для ключа localStorage бронювань
  const getStorageKey = useCallback(() => {
    return currentUser ? `bookings_${currentUser.uid}` : null;
  }, [currentUser]);

  // Завантаження турів із Firestore з отриманням середньої оцінки (без повного списку відгуків)
  const fetchToursWithRatings = useCallback(async () => {
    try {
      const toursCollectionRef = collection(db, "Tours");
      const snapshot = await getDocs(toursCollectionRef);
      const toursData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const toursDataWithRatings = await Promise.all(
        toursData.map(async (tour) => {
          try {
            const response = await fetch(`http://localhost:5000/api/reviews?tourName=${encodeURIComponent(tour.destination)}`);
            if (response.ok) {
              const result = await response.json();
              return { ...tour, averageRating: result.averageRating || 0 };
            } else {
              console.error(`Помилка відповіді для ${tour.destination}: статус ${response.status}`);
              return { ...tour, averageRating: 0 };
            }
          } catch (err) {
            console.error("Помилка завантаження оцінки для туру", tour.destination, err);
            return { ...tour, averageRating: 0 };
          }
        })
      );

      toursDataWithRatings.sort((a, b) => b.averageRating - a.averageRating);
      setTours(toursDataWithRatings);
    } catch (error) {
      console.error('Помилка завантаження турів з Firestore:', error);
    }
  }, []);

  useEffect(() => {
    fetchToursWithRatings();
  }, [fetchToursWithRatings]);

  // Завантаження бронювань з localStorage для поточного користувача
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
    if (!currentUser) return;
    const alreadyBooked = bookedTours.find(
      (b) => b.destination === tour.destination && b.userId === currentUser.uid
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

  // Функція відкриття вікна для залишення відгуку
  const handleLeaveReview = (tour) => {
    if (!currentUser) {
      alert("Будь ласка, увійдіть, щоб залишити відгук");
      return;
    }
    setActiveReviewTour(tour);
    setReviewModalVisible(true);
  };

 const handleConfirmReview = async () => {
    if (!currentUser || !activeReviewTour) return;
    const review = {
      tourName: activeReviewTour.destination,
      reviewerName: currentUser.email,
      createdAt: new Date(),  // сервер може перезаписати це поле, якщо потрібно
      rating: reviewRating,
      reviewText: reviewText,
    };

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(review)
      });

      if (!response.ok) {
        // Якщо сервер повернув помилку (наприклад, через заборонені слова)
        const errorData = await response.json();
        console.error('Помилка при збереженні відгуку:', errorData);
        alert(errorData.error || 'Сталася помилка при збереженні відгуку.');
        return;
      }

      const data = await response.json();
      console.log("Відгук збережено з ID:", data.id);

      setReviewModalVisible(false);
      setActiveReviewTour(null);
      setReviewRating(0);
      setReviewText("");
      // Оновлюємо дані турів для оновлення середньої оцінки
      await fetchToursWithRatings();
    } catch (error) {
      console.error("Помилка при відправці відгуку:", error);
    }
  };


  // Функція перегляду відгуків – відкриває окреме вікно для вибраного туру
  const handleViewReviews = async (tour) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews?tourName=${encodeURIComponent(tour.destination)}`);
      if (response.ok) {
        const data = await response.json();
        setReviewsForTour(data.reviews);
        setReviewsAverage(data.averageRating);
      } else {
        console.error(`Помилка завантаження відгуків для ${tour.destination}: статус ${response.status}`);
        setReviewsForTour([]);
        setReviewsAverage(0);
      }
    } catch (error) {
      console.error(`Помилка завантаження відгуків для ${tour.destination}:`, error);
      setReviewsForTour([]);
      setReviewsAverage(0);
    }
    setActiveReviewsTour(tour);
    setReviewsModalVisible(true);
  };

  // Функція сортування турів за ціною
  const handleSortByPrice = () => {
    const sortedTours = [...tours].sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
      return sortAsc ? priceA - priceB : priceB - priceA;
    });
    setTours(sortedTours);
    setSortAsc(!sortAsc);
  };

  return (
    <section id="tour-list">
      <h2>Гарячі тури</h2>
      <button onClick={handleSortByPrice}>
        {sortAsc ? "Сортувати за зростанням ціни" : "Сортувати за зменшенням ціни"}
      </button>
      <div className="tour-list">
        {tours.map((tour, index) => {
          const alreadyBooked =
            currentUser &&
            bookedTours.find(
              (b) => b.destination === tour.destination && b.userId === currentUser.uid
            );
          return (
            <div className={`tour-card ${tour.highlight ? "highlight" : ""}`} key={index}>
              <img src={`${process.env.PUBLIC_URL}/Tours${tour.image}`} alt={tour.destination} />
              <h3>{tour.destination}</h3>
              {typeof tour.averageRating === "number" && (
                <div className="tour-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < Math.round(tour.averageRating) ? "star filled" : "star"}
                      style={{ color: i < Math.round(tour.averageRating) ? "#ffc107" : "#e4e5e9" }}
                    >
                      &#9733;
                    </span>
                  ))}
                  <span> ({tour.averageRating.toFixed(1)})</span>
                </div>
              )}
              <p>Тривалість: {tour.duration}</p>
              <p>Ціна: {tour.price}</p>

              {/* Кнопка для залишення відгуку */}
              <button className="leave-review" onClick={() => handleLeaveReview(tour)} style={{ marginBottom: "10px" }}>
                Залишити відгук
              </button>

              {/* Кнопка для перегляду відгуків (окреме вікно) */}
              <button className="view-reviews" onClick={() => handleViewReviews(tour)} style={{ marginBottom: "10px" }}>
                Відгуки
              </button>

              {/* Кнопка бронювання */}
              <button className={`book-now${alreadyBooked ? " booked" : ""}`} onClick={() => handleBook(tour)} disabled={!currentUser || !!alreadyBooked}>
                {!currentUser ? "Зареєструйтеся" : alreadyBooked ? "Заброньовано" : "Забронювати"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Модальне вікно для бронювання */}
      {modalVisible && (
        <Modal visible={modalVisible} onConfirm={handleConfirm} onCancel={handleCancelModal} />
      )}

      {/* Модальне вікно для залишення відгуку */}
      {reviewModalVisible && (
        <div className="review-modal-overlay">
          <div className="review-modal-content">
            <h3>Залиште відгук для туру: {activeReviewTour && activeReviewTour.destination}</h3>
            <div className="review-rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} onClick={() => setReviewRating(i + 1)} className={i < reviewRating ? "filled" : ""}>
                  &#9733;
                </span>
              ))}
            </div>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Ваш відгук..." rows="4" />
            <div className="review-modal-buttons">
              <button onClick={handleConfirmReview}>Відправити відгук</button>
              <button onClick={() => setReviewModalVisible(false)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      {/* Окреме модальне вікно для перегляду відгуків */}
      {reviewsModalVisible && (
        <div className="reviews-modal-overlay">
          <div className="reviews-modal-content">
            <h3>Відгуки для туру: {activeReviewsTour && activeReviewsTour.destination}</h3>
            <p>Середній рейтинг: {reviewsAverage.toFixed(1)}</p>
            {reviewsForTour.length > 0 ? (
              reviewsForTour.map((rev) => (
                <div key={rev.id} className="review">
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < rev.rating ? "star filled" : "star"}>
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <p>{rev.reviewText}</p>
                  <p>
                    <strong>Відгук залишив:</strong> {rev.reviewerName}
                  </p>
                  <p>
                    <strong>Дата:</strong> {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              ))
            ) : (
              <p>Відгуків немає.</p>
            )}
            <button onClick={() => setReviewsModalVisible(false)}>Закрити</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomePage;
