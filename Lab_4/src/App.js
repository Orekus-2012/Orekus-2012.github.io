import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import TourReviews from './pages/TourReviews';
import HomePage from './pages/Home';
import BookingsPage from './pages/Bookings';
import ContactsPage from './pages/Contacts';
import Login from './components/Login';
import Register from './components/Register';



const App = () => {
  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/tour/:tourId/reviews" element={<TourReviews />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
