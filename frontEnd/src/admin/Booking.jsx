import './css/Booking.css';
import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';

const API_URL = 'http://localhost:3000/api/booking';
const DOCTORS_API_URL = 'http://localhost:3000/api/doctor';

function Booking() {
    // State management
    const [bookings, setBookings] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('admin'); // This should come from authentication
    
    // Popup states
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupFinish, setShowPopupFinish] = useState(false);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [bookingToFinish, setBookingToFinish] = useState(null);
    
    // Form states
    const [bookingForm, setBookingForm] = useState({
        name: '',
        phone: '',
        doctor: '',
        date: '',
        time: '',
        case: '',
        description: ''
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Time slot management
    const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
    const allTimeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Fetch bookings from API
    const fetchBookings = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    // 'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setBookings(data);
        } catch (err) {
            setError('Failed to fetch bookings: ' + err.message);
            console.error('Error fetching bookings:', err);
        }
    };

    // Fetch doctors from API
    const fetchDoctors = async () => {
        try {
            const response = await fetch(DOCTORS_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setDoctors(data);
        } catch (err) {
            setError('Failed to fetch doctors: ' + err.message);
            console.error('Error fetching doctors:', err);
        }
    };

    // Fetch booked time slots for a specific doctor and date
    const fetchBookedTimeSlots = async (doctor, date) => {
        try {
            const response = await fetch(`${API_URL}/timeslots?doctor=${encodeURIComponent(doctor)}&date=${date}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setBookedTimeSlots(data.bookedSlots || []);
            }
        } catch (err) {
            console.error('Error fetching booked time slots:', err);
        }
    };

    // Initial data loading
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchBookings(), fetchDoctors()]);
            setLoading(false);
        };
        
        loadData();
    }, []);

    // Update booked time slots when doctor or date changes
    useEffect(() => {
        if (bookingForm.doctor && bookingForm.date) {
            fetchBookedTimeSlots(bookingForm.doctor, bookingForm.date);
        } else {
            setBookedTimeSlots([]);
        }
    }, [bookingForm.doctor, bookingForm.date]);

    // Form handlers
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setBookingForm(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear time when doctor or date changes
        if (name === 'doctor' || name === 'date') {
            setBookingForm(prev => ({
                ...prev,
                time: ''
            }));
        }
        
        // Clear form error when user starts typing
        if (formError) {
            setFormError('');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...bookingForm,
                    status: 'scheduled'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            const newBooking = await response.json();
            setBookings(prev => [...prev, newBooking]);
            closeBookingForm();
            
            // Show success message (you can implement a toast notification)
            alert('Booking created successfully!');
            
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Delete booking
    const confirmDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/${bookingToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }

            setBookings(prev => prev.filter(booking => booking._id !== bookingToDelete));
            closePopup();
            
            // Show success message
            alert('Booking deleted successfully!');
            
        } catch (err) {
            alert('Error deleting booking: ' + err.message);
        }
    };

    // Complete booking
    const confirmFinish = async () => {
        try {
            const response = await fetch(`${API_URL}/${bookingToFinish}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'completed' })
            });

            if (!response.ok) {
                throw new Error('Failed to complete booking');
            }

            const updatedBooking = await response.json();
            setBookings(prev => prev.map(booking => 
                booking._id === bookingToFinish ? updatedBooking : booking
            ));
            closePopup();
            
            // Show success message
            alert('Booking marked as completed!');
            
        } catch (err) {
            alert('Error completing booking: ' + err.message);
        }
    };

    // Popup handlers
    const openDetailPopup = (booking) => {
        setSelectedBooking(booking);
        setShowDetailPopup(true);
    };

    const openDeletePopup = (bookingId) => {
        setBookingToDelete(bookingId);
        setShowPopup(true);
    };

    const openFinishPopup = (bookingId) => {
        setBookingToFinish(bookingId);
        setShowPopupFinish(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setShowPopupFinish(false);
        setShowDetailPopup(false);
        setSelectedBooking(null);
        setBookingToDelete(null);
        setBookingToFinish(null);
    };

    const closeBookingForm = () => {
        setShowBookingForm(false);
        setBookingForm({
            name: '',
            phone: '',
            doctor: '',
            date: '',
            time: '',
            case: '',
            description: ''
        });
        setFormError('');
        setSubmitting(false);
    };

    // Utility functions
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const isTimeSlotBooked = (timeSlot) => {
        return bookedTimeSlots.includes(timeSlot);
    };

    const isTimeSlotPassed = (timeSlot) => {
        if (!bookingForm.date) return false;
        
        const today = new Date();
        const selectedDate = new Date(bookingForm.date);
        
        // If selected date is not today, time hasn't passed
        if (selectedDate.toDateString() !== today.toDateString()) {
            return false;
        }
        
        // Check if time slot has passed today
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);
        
        return slotTime < today;
    };

    const formatTimeDisplay = (timeSlot) => {
        const [hours, minutes] = timeSlot.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    if (loading) {
        return (
            <>
                <Dashboard />
                <div className="container_admin">
                    <div className="loading-message">Loading bookings...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Dashboard />
                <div className="container_admin">
                    <div className="error-message">
                        Error: {error}
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Dashboard />
            <div className="container_admin">
                <div className="box-list-bookings">
                    {/* Add booking button */}
                    <div className="booking-header">
                        <h2>Booking Management</h2>
                        <button 
                            className="add-booking-button"
                            onClick={() => setShowBookingForm(true)}
                        >
                            Add New Booking
                        </button>
                    </div>

                    {/* Bookings Table */}
                    {bookings.length === 0 ? (
                        <p className="no-bookings-message">No bookings found.</p>
                    ) : (
                        <table className="booking-list-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Doctor</th>
                                    <th>Date & Time</th>
                                    <th>Case</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td>{booking.name}</td>
                                        <td>{booking.doctor}</td>
                                        <td>{booking.date} at {booking.time}</td>
                                        <td>{booking.case}</td>
                                        <td>
                                            <span className={`status-badge ${booking.status}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="view-button"
                                                    onClick={() => openDetailPopup(booking)}
                                                    aria-label="View booking details"
                                                >
                                                    <i className="bx bx-show"></i> View
                                                </button>

                                                {userRole === 'admin' && booking.status !== 'completed' && (
                                                    <button
                                                        className="complete-button"
                                                        onClick={() => openFinishPopup(booking._id)}
                                                        aria-label="Mark booking as finished"
                                                    >
                                                        <i className="bx bx-check"></i> Complete
                                                    </button>
                                                )}

                                                {userRole === 'admin' && (
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => openDeletePopup(booking._id)}
                                                        aria-label="Delete booking"
                                                    >
                                                        <i className="bx bx-trash"></i> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Booking Form Popup */}
                    {showBookingForm && (
                        <div className="popup_detail">
                            <div className="popup_detail_content booking-form-popup">
                                <div className="detail_header">
                                    <h2>Create New Booking</h2>
                                    <button
                                        className="button_close"
                                        onClick={closeBookingForm}
                                        aria-label="Close booking form"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="detail_body">
                                    {formError && (
                                        <div className="form-error">
                                            {formError}
                                        </div>
                                    )}

                                    <form className="form-content" onSubmit={handleFormSubmit}>
                                        <div className="form-group">
                                            <label className="label-form">Full Name:</label>
                                            <input
                                                className="input-form"
                                                type="text"
                                                name="name"
                                                placeholder="Enter your full name..."
                                                value={bookingForm.name}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="label-form">Phone Number:</label>
                                            <input
                                                className="input-form"
                                                type="text"
                                                name="phone"
                                                placeholder="Enter your phone number..."
                                                value={bookingForm.phone}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="label-form">Doctor:</label>
                                            <select
                                                name="doctor"
                                                className="select-doctor"
                                                value={bookingForm.doctor}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                <option value="">Select a doctor</option>
                                                {doctors.map((doctor) => (
                                                    <option key={doctor._id || doctor.id} value={doctor.fullName || doctor.name}>
                                                        {doctor.fullName || doctor.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="label-form">Date:</label>
                                            <input
                                                className="input-form"
                                                type="date"
                                                name="date"
                                                value={bookingForm.date}
                                                onChange={handleFormChange}
                                                min={getCurrentDate()}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="label-form">Time:</label>
                                            <select
                                                name="time"
                                                className="select-doctor"
                                                value={bookingForm.time}
                                                onChange={handleFormChange}
                                                disabled={!bookingForm.doctor || !bookingForm.date}
                                                required
                                            >
                                                <option value="">Select a time slot</option>
                                                {allTimeSlots.map((timeSlot) => (
                                                    <option
                                                        key={timeSlot}
                                                        value={timeSlot}
                                                        disabled={isTimeSlotBooked(timeSlot) || isTimeSlotPassed(timeSlot)}
                                                    >
                                                        {formatTimeDisplay(timeSlot)}
                                                        {isTimeSlotBooked(timeSlot) ? ' (Booked)' : ''}
                                                        {!isTimeSlotBooked(timeSlot) && isTimeSlotPassed(timeSlot) ? ' (Passed)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {!bookingForm.doctor && <p className="text-muted">Please select a doctor first</p>}
                                            {!bookingForm.date && bookingForm.doctor && <p className="text-muted">Please select a date</p>}
                                            {bookingForm.doctor && bookingForm.date && bookedTimeSlots.length === allTimeSlots.length && (
                                                <p className="text-muted">All time slots are booked for this doctor on this date</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="label-form">Case:</label>
                                            <input
                                                className="input-form"
                                                type="text"
                                                name="case"
                                                placeholder="Enter case type..."
                                                value={bookingForm.case}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="label-form">Description:</label>
                                            <textarea
                                                className="input-form"
                                                name="description"
                                                placeholder="Enter description (optional)..."
                                                value={bookingForm.description}
                                                onChange={handleFormChange}
                                                rows="3"
                                            />
                                        </div>
                                    </form>
                                </div>

                                <div className="detail_footer">
                                    <button
                                        className="btn_finish"
                                        onClick={handleFormSubmit}
                                        disabled={submitting}
                                        aria-label="Create booking"
                                    >
                                        {submitting ? 'Creating...' : 'Create Booking'}
                                    </button>
                                    <button
                                        className="btn_cancel"
                                        onClick={closeBookingForm}
                                        aria-label="Cancel booking creation"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Popup */}
                    {showPopup && userRole === 'admin' && (
                        <div className="popup_delete">
                            <div className="popup_delete_content">
                                <h3>Are you sure you want to delete this booking?</h3>
                                <div className="popup_buttons">
                                    <button
                                        className="btn_delete"
                                        onClick={confirmDelete}
                                        aria-label="Confirm delete booking"
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        className="btn_cancel"
                                        onClick={closePopup}
                                        aria-label="Cancel delete booking"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complete Confirmation Popup */}
                    {showPopupFinish && userRole === 'admin' && (
                        <div className="popup_delete">
                            <div className="popup_delete_content">
                                <h3>Are you sure you want to mark this booking as completed?</h3>
                                <div className="popup_buttons">
                                    <button
                                        className="btn_finish"
                                        onClick={confirmFinish}
                                        aria-label="Confirm finish booking"
                                    >
                                        Yes, Complete
                                    </button>
                                    <button
                                        className="btn_cancel"
                                        onClick={closePopup}
                                        aria-label="Cancel finish booking"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking Detail Popup */}
                    {showDetailPopup && selectedBooking && (
                        <div className="popup_detail">
                            <div className="popup_detail_content">
                                <div className="detail_header">
                                    <h2>Booking Details</h2>
                                    <button
                                        className="button_close"
                                        onClick={closePopup}
                                        aria-label="Close details popup"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="detail_body">
                                    <div className="detail_item">
                                        <h3>Name</h3>
                                        <p>{selectedBooking.name}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Phone</h3>
                                        <p>{selectedBooking.phone}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Doctor</h3>
                                        <p>{selectedBooking.doctor}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Date</h3>
                                        <p>{selectedBooking.date}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Time</h3>
                                        <p>{selectedBooking.time}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Case</h3>
                                        <p>{selectedBooking.case}</p>
                                    </div>

                                    <div className="detail_item full-width">
                                        <h3>Description</h3>
                                        <p className="booking-description">
                                            {selectedBooking.description || 'No description provided'}
                                        </p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Status</h3>
                                        <p>
                                            <span className={`status-badge ${selectedBooking.status.toLowerCase()}`}>
                                                {selectedBooking.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="detail_footer">
                                    {userRole === 'admin' && selectedBooking.status !== 'completed' && (
                                        <button
                                            className="btn_finish"
                                            onClick={() => {
                                                closePopup();
                                                openFinishPopup(selectedBooking._id);
                                            }}
                                            aria-label="Mark booking as finished"
                                        >
                                            Complete Booking
                                        </button>
                                    )}

                                    {userRole === 'admin' && (
                                        <button
                                            className="btn_delete"
                                            onClick={() => {
                                                closePopup();
                                                openDeletePopup(selectedBooking._id);
                                            }}
                                            aria-label="Delete booking"
                                        >
                                            Delete Booking
                                        </button>
                                    )}

                                    <button
                                        className="btn_close"
                                        onClick={closePopup}
                                        aria-label="Close booking details"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Booking;