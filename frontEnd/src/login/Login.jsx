import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css';

const API_URL = 'http://localhost:3000/api/user';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the return URL from location state, or default to '/'
    const from = location.state?.from || '/';

    // Check if user is already logged in
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Check if token exists in localStorage
                const token = localStorage.getItem('authToken');
                
                if (token) {
                    // Verify token with the server
                    const response = await axios.get(`${API_URL}/users/verify`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    if (response.data.user) {
                        // If returning from a protected page, navigate there
                        if (from !== '/login' && from !== '/') {
                            navigate(from, { replace: true });
                        } else if (response.data.user.role === 'admin') {
                            navigate('/dctoradmin', { replace: true });
                        } else {
                            navigate('/', { replace: true });
                        }
                    }
                }
            } catch (error) {
                // If token verification fails, clear localStorage
                localStorage.removeItem('authToken');
                console.error('Auth verification error:', error);
            }
        };

        checkAuthStatus();
    }, [navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Send login request to the server
            const response = await axios.post(`${API_URL}`, {
                email,
                password
            });

            // Store the JWT token in localStorage
            localStorage.setItem('authToken', response.data.token);
            
            // Store user data if needed
            if (response.data.user) {
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                
                // Redirect based on user role
                if (from !== '/login' && from !== '/') {
                    navigate(from, { replace: true });
                } else if (response.data.user.role === 'admin') {
                    navigate('/dctoradmin', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle different error types
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 401) {
                    setError('Invalid email or password. Please try again.');
                } else if (error.response.status === 404) {
                    setError('No account found with this email.');
                } else if (error.response.status === 429) {
                    setError('Too many failed login attempts. Please try again later.');
                } else {
                    setError(error.response.data.message || 'Failed to sign in. Please try again.');
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError('Server not responding. Please try again later.');
            } else {
                // Something happened in setting up the request
                setError('Failed to sign in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container_register d-flex justify-content-center align-items-center min-vh-100">
            <div className="w-50 style_conten">
                <div className="box_title">
                    <h2>Login</h2>
                    <Link to='/'>
                        <i className='bx bx-x'></i>
                    </Link>
                </div>

                {/* Show error message if there's an error */}
                {error && <div className="error_message" role="alert">{error}</div>}

                {/* If redirected from a protected route, show message */}
                {location.state?.from && from !== '/login' && from !== '/' && (
                    <div className="info-message" role="status">
                        Please log in to access the requested page.
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="login-footer link_to_register">
                    <p>
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;