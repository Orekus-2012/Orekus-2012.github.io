import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Після успішного входу перекидаємо на головну сторінку
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-form">
      <h2>Вхід</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </label>
        <label>
          Пароль:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </label>
        <button type="submit">Увійти</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
