document.addEventListener("DOMContentLoaded", function () {
    console.log('Скрипт завантажено.');

    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
    }

    const tourList = document.querySelector('.tour-list');
    if (tourList) {
        console.log('Контейнер для турів знайдено.');

        fetch('tours.json')
            .then(response => {
                console.log('Файл завантажено:', response);
                return response.json();
            })
            .then(tours => {
                console.log('Тури:', tours);

                let i = 0;
                while (i < tours.length) {
                    const tour = tours[i];
                    console.log('Обробка туру:', tour);

                    const tourCard = document.createElement('div');
                    tourCard.classList.add('tour-card');

                    const img = document.createElement('img');
                    img.src = `Tours/${tour.image}`;
                    img.alt = tour.destination;
                    tourCard.appendChild(img);

                    const h3 = document.createElement('h3');
                    h3.textContent = tour.destination;
                    tourCard.appendChild(h3);

                    const pDuration = document.createElement('p');
                    pDuration.textContent = `Тривалість: ${tour.duration}`;
                    tourCard.appendChild(pDuration);

                    const pPrice = document.createElement('p');
                    pPrice.textContent = `Ціна: ${tour.price}`;
                    tourCard.appendChild(pPrice);

                    const button = document.createElement('button');
                    button.classList.add('book-now');
                    button.textContent = 'Забронювати';
                    tourCard.appendChild(button);

                    button.addEventListener('click', function () {
                        console.log('Кнопка "Забронювати" натиснута для туру:', tour);
                    
                        const modal = document.getElementById('date-modal');
                        modal.classList.remove('hidden');
                    
                        const confirmButton = document.getElementById('confirm-date');
                        const cancelButton = document.getElementById('cancel-date');
                        const dateInput = document.getElementById('tour-date');
                    
                        confirmButton.onclick = function () {
                            const selectedDate = dateInput.value;
                            if (!selectedDate) {
                                alert('Будь ласка, виберіть дату!');
                                return;
                            }
                    
                            console.log(`Дата вибрана: ${selectedDate}`);
                    
                            let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
                            bookings.push({ ...tour, date: selectedDate });
                            localStorage.setItem('bookings', JSON.stringify(bookings));
                    
                            button.textContent = 'Заброньовано';
                            button.style.background = 'green';
                            button.style.color = 'white';
                            button.disabled = true;
                    
                            modal.classList.add('hidden');
                        };
                    
                        cancelButton.onclick = function () {
                            modal.classList.add('hidden');
                        };
                    });

                    tourList.appendChild(tourCard);

                    i++;
                }
            })
            .catch(error => {
                console.error('Помилка завантаження даних:', error);
            });
    }

    const bookingsTable = document.querySelector('.booking-table tbody');
    if (bookingsTable) {
        console.log('Таблиця "Мої бронювання" знайдена.');

        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.forEach((tour, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${tour.destination}</td>
                <td>${tour.duration}</td>
                <td>${tour.date || 'Не вказано'}</td> <!-- Додаємо дату -->
                <td>${tour.price}</td>
                <td>
                    <button class="cancel-btn">Скасувати</button>
                </td>
            `;

            const cancelButton = newRow.querySelector('.cancel-btn');
            cancelButton.addEventListener('click', function () {
                console.log(`Скасування туру: ${tour.destination}`);

                newRow.remove();

                let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

                const updatedBookings = bookings.filter((booking) => 
                    booking.destination !== tour.destination ||
                    booking.date !== tour.date // Видаляємо конкретний тур із датою
                );

                localStorage.setItem('bookings', JSON.stringify(updatedBookings));

                console.log('Тур успішно скасовано.');
            });

            bookingsTable.appendChild(newRow);
        });
    }

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        console.log('Контейнер для мапи знайдено.');

        const map = L.map('map').setView([50.4501, 30.5234], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        fetch('places.json')
            .then(response => response.json())
            .then(places => {
                console.log('Дані для мапи:', places);

                places.forEach(place => {
                    const marker = L.marker(place.coords).addTo(map);
                    marker.bindPopup(`<b>${place.name}</b><br>${place.description}`);
                });
            })
            .catch(error => {
                console.error('Помилка завантаження даних для мапи:', error);
            });
    }
});