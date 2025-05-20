import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Types of protected routes
const ROUTE_TYPES = {
    ADMIN: 'admin',
    USER: 'user',
};

function ProtectedRoute({ routeType = ROUTE_TYPES.USER }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const location = useLocation();
    const API_URL = 'http://localhost:3000/api';

    useEffect(() => {
        const checkAuthorization = async () => {
            // Get token from localStorage
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            try {
                // Verify token with backend
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
                    setAuthorized(false);
                    setLoading(false);
                    return;
                }

                // Get user data from response
                const userData = await response.json();
                const userRole = userData.role || 'user'; // Default to 'user' if no role is specified

                // Check if user is authorized based on route type
                switch (routeType) {
                    case ROUTE_TYPES.ADMIN:
                        setAuthorized(userRole === 'admin');
                        break;
                    case ROUTE_TYPES.USER:
                        setAuthorized(true); // All authenticated users can access user routes
                        break;
                    default:
                        setAuthorized(false);
                }
            } catch (error) {
                console.error('Error checking user authorization:', error);
                localStorage.removeItem('authToken');
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthorization();
    }, [routeType]);

    if (loading) {
        // You can replace this with a loading spinner component
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!authorized) {
        // Redirect to login with the return URL
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // If user is authorized, render the child routes
    return <Outlet />;
}

export { ProtectedRoute, ROUTE_TYPES };