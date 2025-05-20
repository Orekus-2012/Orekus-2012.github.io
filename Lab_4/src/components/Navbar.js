import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const NavBar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault(); // Запобігаємо дефолтному переходу
    try {
      await signOut(auth);
      navigate('/'); // Перенаправлення після виходу
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  return (
    <header>
      <nav>
        <a href="/" className="logo">Райські тури</a>
        <ul>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Гарячі тури
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/bookings"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Мої бронювання
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contacts"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Контакти
            </NavLink>
          </li>
          <li>
            <NavLink
            to="/tour/defaultTourId/reviews"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Відгуки
          </NavLink>
          </li>
          {currentUser ? (
            <li>
              <NavLink
                to="/exit"
                onClick={handleLogout}
                className="logout-btn"
              >
                Вихід
              </NavLink>
            </li>
          ) : (
            <>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Вхід
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Реєстрація
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
