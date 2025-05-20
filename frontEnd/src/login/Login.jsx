import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const API_URL = 'http://localhost:3000/api';

    // Get the return URL from location state, or default to '/'
    const from = location.state?.from || '/';

    // Check if user is already logged in
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Get token from localStorage
            const token = localStorage.getItem('authToken');
            
            if (token) {
                try {
                    // Verify token with backend
                    const response = await fetch(`${API_URL}/user/current`, {
                        method: 'GET',
                        headers: {
                            'authtoken': token,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        
                        // If returning from a protected page, navigate there
                        if (from !== '/login' && from !== '/') {
                            navigate(from, { replace: true });
                        } else if (userData.role === 'admin') {
                            navigate('/dctoradmin', { replace: true });
                        } else {
                            navigate('/', { replace: true });
                        }
                    } else {
                        // Token invalid or expired, clear it
                        localStorage.removeItem('authToken');
                    }
                } catch (error) {
                    console.error('Error verifying authentication:', error);
                    localStorage.removeItem('authToken');
                }
            }
        };

        checkAuthStatus();
    }, [navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store the token in localStorage
            localStorage.setItem('authToken', data.token);
            
            // Store user data if needed
            if (data.payload && data.payload.user) {
                localStorage.setItem('userData', JSON.stringify(data.payload.user));
            }

            // Redirect based on user role
            if (from !== '/login' && from !== '/') {
                navigate(from, { replace: true });
            } else if (data.payload && data.payload.user && data.payload.user.role === 'admin') {
                navigate('/dctoradmin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }

        } catch (error) {
            console.error('Error signing in:', error);
            
            // Set user-friendly error message
            setError(error.message || 'Failed to sign in. Please try again.');
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