document.addEventListener("DOMContentLoaded", function () {
    showSection('hot-tours'); // Показуємо "Гарячі тури" за замовчуванням
});

function showSection(sectionId) {
    let sections = document.querySelectorAll('.content-section');
    
    sections.forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
}

// Додає тур у список бронювань
function bookTour(tourName, duration, price) {
    let bookingList = document.getElementById('booking-list');
    
    // Видалення повідомлення про відсутність бронювань
    if (bookingList.children[0].textContent === "Поки що немає заброньованих турів.") {
        bookingList.innerHTML = ''; 
    }

    // Створення нового елемента списку з детальною інформацією
    let listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${tourName}</strong> - ${duration} - Ціна: ${price}$`;

    // Додавання елемента в список
    bookingList.appendChild(listItem);
}

// Обробник форми контактів
document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();
    alert("Дякуємо! Ваше повідомлення надіслано.");
    this.reset();
});
