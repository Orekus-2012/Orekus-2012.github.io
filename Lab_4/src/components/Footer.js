import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      <p>&copy; {currentYear} Платформа бронювання турів</p>
    </footer>
  );
};

export default Footer;
