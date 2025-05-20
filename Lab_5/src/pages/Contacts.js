import React from 'react';

const ContactsPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Повідомлення надіслано!");
  };

  return (
    <main>
      <h2>Контакти</h2>
      <section>
        <h3>Контакти фірми</h3>
        <p>Email: support@tours.com</p>
        <p>Телефон: +380 67 123 45 67</p>
      </section>
      <section>
        <h3>Зворотній зв'язок</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Ваше ім'я" required />
          <input type="email" placeholder="Ваш email" required />
          <textarea placeholder="Ваше повідомлення" required></textarea>
          <button type="submit">Надіслати</button>
        </form>
      </section>
      <section>
        <h3>Місцезнаходження</h3>
        <div className="map-container">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25577.10655925221!2d30.500875!3d50.4501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cdddcfd62e97%3A0x421eb8f029f63f9!2z0JzQvtC70YPRg9C60LvQtdC90Lgg0JvQu9C-0Y7QsyDwnJrwn9yD!5e0!3m2!1suk!2sua!4v1614092491200!5m2!1suk!2sua"
            width="800"
            height="450"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen=""
            aria-hidden="false"
            tabIndex="0"
          ></iframe>
        </div>
      </section>
    </main>
  );
};

export default ContactsPage;
