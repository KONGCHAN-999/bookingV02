import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/login.css';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000/api/register/';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}`, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Registration successful:', response.data);

      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token); // Consider secure alternatives
      }

      navigate('/home');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          setError(data.message || 'Invalid input data.');
        } else if (status === 409) {
          setError(data.message || 'Email already exists.');
        } else {
          setError('Registration failed. Please try again.');
        }
        console.error('Registration error:', error.response.data);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
        console.error('No response received:', error.request);
      } else {
        setError('An error occurred. Please try again later.');
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container_register d-flex justify-content-center align-items-center min-vh-100">
      <div className="w-50 style_conten">
        <div className="box_title">
          <h2>Register</h2>
          <Link to="/" aria-label="Close">
            <i className="bx bx-x"></i>
          </Link>
        </div>
        {error && (
          <div id="error-message" className="alert alert-danger">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              aria-describedby={error ? 'error-message' : null}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              aria-describedby={error ? 'error-message' : null}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              aria-describedby={error ? 'error-message' : null}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="login-footer link_to_register">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;