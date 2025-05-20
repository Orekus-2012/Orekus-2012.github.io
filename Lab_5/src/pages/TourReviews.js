import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles.css';

const TourReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Зчитування відгуків з колекції "Review"
    const reviewsRef = collection(db, 'Review');
    // Упорядкування за датою створення (якщо є поле createdAt)
    const q = query(reviewsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Відгуки з Firestore:', reviewsData);
        setReviews(reviewsData);
      },
      (error) => {
        console.error('Помилка при завантаженні відгуків:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="tour-reviews">
      <h1>Всі відгуки</h1>
      {reviews.length > 0 ? (
        reviews.map((rev) => {
          let reviewDate = '';
          if (rev.createdAt) {
            reviewDate = rev.createdAt.toDate().toLocaleDateString();
          }
          return (
            <div key={rev.id} className="review">
              {/* Назва туру із класом для великого шрифту */}
              <h4 className="tour-name">
                {rev.tourName ? rev.tourName : 'Невідомий тур'}
              </h4>
              <div className="review-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < rev.rating ? 'star filled' : 'star'}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
              {/* Коментар з додатковою рамкою */}
              <div className="review-comment">
                {rev.reviewText}
              </div>
              <p>
                <strong>Відгук залишив:</strong>{' '}
                {rev.reviewerName ? rev.reviewerName : 'Невідомий'}
              </p>
              <p>
                <strong>Дата:</strong> {reviewDate}
              </p>
            </div>
          );
        })
      ) : (
        <p>Відгуків немає.</p>
      )}
    </div>
  );
};

export default TourReviews;
