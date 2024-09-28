import React, { useState } from 'react';
import './auth.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Auth = ({ onLogin, onClose }) => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [linkedinEmail, setLinkedinEmail] = useState('');
  const [linkedinPassword, setLinkedinPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = `http://localhost:8000/${isSigningUp ? 'register' : 'login'}`;
    const body = isSigningUp
      ? { username, password, linkedinEmail, linkedinPassword }
      : { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      if (isSigningUp) {
        console.log('Signup successful');
        setIsSigningUp(false); // Switch to login view after successful signup
      } else {
        console.log('Login successful');
        onLogin(data.username);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <button className="back-button" onClick={onClose}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isSigningUp ? 'Sign Up' : 'Login'}</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isSigningUp && (
            <>
              <input
                type="email"
                placeholder="LinkedIn Email"
                value={linkedinEmail}
                onChange={(e) => setLinkedinEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="LinkedIn Password"
                value={linkedinPassword}
                onChange={(e) => setLinkedinPassword(e.target.value)}
                required
              />
            </>
          )}
          <button type="submit">{isSigningUp ? 'Sign Up' : 'Login'}</button>
          <button type="button" className="toggle-button" onClick={() => setIsSigningUp(!isSigningUp)}>
            {isSigningUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;