import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/NavBar.css';
import logo from '../assets/logo.png';

function NavBar() {
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000/api';

  const handlePopupAccount = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    // Check for authentication token and fetch user data
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setUser(null);
        return;
      }
      
      try {
        // Verify token with backend and get user data
        const response = await fetch(`${API_URL}/user/current`, {
          method: 'GET',
          headers: {
            'authtoken': token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Token invalid or expired
          localStorage.removeItem('authToken');
          setUser(null);
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array since we only want to fetch user data once on component mount

  useEffect(() => {
    if (showPopup) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.popup_account_content')) {
          closePopup();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPopup]);

  const handleLogout = async () => {
    try {
      // Call logout endpoint if needed
      const token = localStorage.getItem('authToken');
      // Note: Server-side logout is not implemented in the provided backend
      // But we could call it here if it was
      
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      setUser(null);
      setShowPopup(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/" className="title-web">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/doctor" className="nav-link">Doctor</Link>

          {user ? (
            <>
              <Link to="/booking" className="nav-link">My Booking</Link>
              <div className="nav-link account-link" onClick={handlePopupAccount}>
                <div className="box_loginAccount">
                  <p>Account</p>
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="profile-thumbnail"
                    />
                  ) : (
                    <span className="profile-initial">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <Link to="/form" className="nav-link nav_login">Appointment</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/login" className="nav-link nav_login">Appointment</Link>
            </>
          )}
        </div>

        {showPopup && (
          <div className="popup_account">
            <div className="popup_account_content">
              {user && (
                <>
                  <div className="user-info">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="profile-image"
                      />
                    ) : (
                      <div className="profile-initial-large">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p><strong>Email:</strong> {user.email}</p>
                    <Link to="/profile" className="logout-button" onClick={closePopup}>
                      Profile detail
                    </Link>
                  </div>
                  <div className="popup-links">
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;