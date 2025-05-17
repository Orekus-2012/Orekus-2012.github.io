import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <header>
      <nav>
        <a href="/" className="logo">Райські тури</a>
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Гарячі тури
            </NavLink>
          </li>
          <li>
            <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Мої бронювання
            </NavLink>
          </li>
          <li>
            <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'active' : '')}>
              Контакти
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
