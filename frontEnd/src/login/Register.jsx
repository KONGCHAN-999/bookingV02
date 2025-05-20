import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/login.css';
import axios from 'axios'; // You'll need to install axios: npm install axios

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      
      // Only append profilePicture if it's selected
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      // Send registration data to your backend API
      const response = await axios.post('/api/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Registration successful:', response.data);
      
      // Save token to localStorage if your backend returns one
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
      }
      
      // Redirect to home page after successful registration
      navigate('/home');

    } catch (error) {
      // Handle errors from the API
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred. Please try again later.');
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container_register d-flex justify-content-center align-items-center min-vh-100">
        <div className="w-50 style_conten">
          <div className="box_title">
            <h2 className="">Register</h2>
            <Link to='/'>
              <i className='bx bx-x'></i>
            </Link>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
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
    </>
  );
}

export default Register;