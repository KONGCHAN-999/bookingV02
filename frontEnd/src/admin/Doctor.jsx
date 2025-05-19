import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import './css/Doctor.css';
import profile01 from '../assets/images/profile01.avif';
import { LuPencil } from "react-icons/lu";

function Doctor() {
    // API endpoints for MongoDB
    const API_URL = 'http://localhost:3000/api/doctor';

    const [doctors, setDoctors] = useState({
        fullName: '',
        age: '',
        specialty: '',
        contact: '',
        email: '',
        education: '',
        experience: '',
        certifications: ''
    });
    const [getDataDoctor, setGetDataDoctor] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // Fetch doctor data from MongoDB API
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const response = await axios.get(API_URL);
                setGetDataDoctor(response.data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };
        fetchDoctorData();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setDoctors({
            fullName: '',
            age: '',
            specialty: '',
            contact: '',
            email: '',
            education: '',
            experience: '',
            certifications: ''
        }); // Clear form
        setEditId(null); // Reset edit mode
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!doctors.fullName || !doctors.email) {
            alert('Full name and email are required!');
            return;
        }

        try {
            if (editId) {
                // Update existing doctor in MongoDB
                await axios.put(`${API_URL}/${editId}`, doctors);
                alert('Doctor updated successfully!');
                setGetDataDoctor((prev) =>
                    prev.map((doc) =>
                        doc._id === editId ? { _id: editId, ...doctors } : doc
                    )
                );
            } else {
                // Add new doctor to MongoDB
                const response = await axios.post(API_URL, doctors);
                alert('Doctor added successfully!');
                setGetDataDoctor((prev) => [
                    ...prev,
                    { _id: response.data._id, ...doctors },
                ]);
            }
            toggleSidebar();
        } catch (error) {
            console.error('Error saving doctor:', error);
            alert('Error saving doctor: ' + error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctors((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const openPopup = (id) => {
        setSelectedDoctorId(id);
        setShowPopup(true);
    };

    const closePopup = () => {
        setSelectedDoctorId(null);
        setShowPopup(false);
    };

    const handleDelete = async (id) => {
        try {
            // Delete doctor from MongoDB
            await axios.delete(`${API_URL}/${id}`);
            setGetDataDoctor((prev) => prev.filter((doctor) => doctor._id !== id));
            alert('Doctor deleted successfully!');
        } catch (error) {
            console.error('Error deleting doctor:', error);
            alert('Error deleting doctor: ' + error.message);
        }
    };

    const confirmDelete = () => {
        if (selectedDoctorId) {
            handleDelete(selectedDoctorId);
        }
        closePopup();
    };

    const handleUpdate = (doctor) => {
        setEditId(doctor._id);
        setDoctors({
            fullName: doctor.fullName || '',
            age: doctor.age || '',
            specialty: doctor.specialty || '',
            contact: doctor.contact || '',
            email: doctor.email || '',
            education: doctor.education || '',
            experience: doctor.experience || '',
            certifications: doctor.certifications || ''
        });
        setIsSidebarOpen(true);
    };

    const handleDetail = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDetailPopup(true);
    };

    const closeDetailPopup = () => {
        setSelectedDoctor(null);
        setShowDetailPopup(false);
    };

    return (
        <div>
            <Dashboard />
            <div className="container_admin">
                <div className="box-list-users">
                    <div className="user-list-header">
                        <h1>Doctor Management</h1>
                        <button className="add-user-button" onClick={toggleSidebar}>
                            <i className="bx bx-plus"></i>
                            Add Doctor
                        </button>
                    </div>

                    <table className="user-list-table">
                        <thead>
                            <tr>
                                <th scope="col">Full Name</th>
                                <th scope="col">Age</th>
                                <th scope="col">Specialty</th>
                                <th scope="col">Contact</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                getDataDoctor.map((doctor) => (
                                    <tr key={doctor._id}>
                                        <td>{doctor.fullName}</td>
                                        <td>{doctor.age}</td>
                                        <td>{doctor.specialty}</td>
                                        <td>{doctor.contact}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleUpdate(doctor)}
                                                    aria-label={`Edit ${doctor.fullName}`}
                                                >
                                                    <LuPencil />
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => openPopup(doctor._id)}
                                                    aria-label={`Delete ${doctor.fullName}`}
                                                >
                                                    <i className="bx bx-trash"></i>
                                                    Delete
                                                </button>
                                                <button
                                                    className="edit-view"
                                                    onClick={() => handleDetail(doctor)}
                                                    aria-label={`View ${doctor.fullName}`}
                                                >
                                                    <i className="bx bx-show"></i>
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Popup */}
                {showPopup && (
                    <div className="popup_delete">
                        <div className="popup_delete_content">
                            <h3>Are you sure you want to delete this Doctor?</h3>
                            <div className="popup_buttons">
                                <button className="button btn_delete" onClick={confirmDelete}>
                                    Yes
                                </button>
                                <button className="button btn_cancel" onClick={closePopup}>
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Doctor Detail Popup */}
                {showDetailPopup && selectedDoctor && (
                    <div className="popup_detail">
                        <div className="popup_detail_content">
                            <div className="detail_header">
                                <h2>Doctor Details</h2>
                                <button className="button_close" onClick={closeDetailPopup}>
                                    <i className="bx bx-x"></i>
                                </button>
                            </div>
                            <div className="box_profileDetail">
                                <div className="detail_item">
                                    <h3>Profile</h3>
                                    <img src={profile01} alt="Not provided" />
                                </div>
                            </div>
                            <div className="detail_body">
                                <div className="detail_item">
                                    <h3>Full Name</h3>
                                    <p>{selectedDoctor.fullName || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Age</h3>
                                    <p>{selectedDoctor.age || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Specialty</h3>
                                    <p>{selectedDoctor.specialty || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Contact</h3>
                                    <p>{selectedDoctor.contact || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Email</h3>
                                    <p>{selectedDoctor.email || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Education</h3>
                                    <p className="detail_text">{selectedDoctor.education || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Experience</h3>
                                    <p className="detail_text">{selectedDoctor.experience || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Certifications</h3>
                                    <p className="detail_text">{selectedDoctor.certifications || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Doctor Sidebar */}
                {isSidebarOpen && (
                    <div className="box_form_addDoctor">
                        <div className="box_group_title">
                            <div></div>
                            <h1>{editId ? 'Edit Doctor' : 'Add New Doctor'}</h1>
                            <button className="button_close" onClick={toggleSidebar}>
                                <i className="bx bx-x"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="form_addDoctor">
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name:</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={doctors.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="age">Age:</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={doctors.age}
                                    onChange={handleChange}
                                    min="18"
                                    max="100"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="specialty">Specialty:</label>
                                <input
                                    type="text"
                                    id="specialty"
                                    name="specialty"
                                    value={doctors.specialty}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact">Contact:</label>
                                <input
                                    type="text"
                                    id="contact"
                                    name="contact"
                                    value={doctors.contact}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={doctors.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="education">Education:</label>
                                <textarea
                                    id="education"
                                    name="education"
                                    value={doctors.education}
                                    onChange={handleChange}
                                    rows="5"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="experience">Experience:</label>
                                <textarea
                                    id="experience"
                                    name="experience"
                                    value={doctors.experience}
                                    onChange={handleChange}
                                    rows="5"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="certifications">Certifications:</label>
                                <textarea
                                    id="certifications"
                                    name="certifications"
                                    value={doctors.certifications}
                                    onChange={handleChange}
                                    rows="5"
                                ></textarea>
                            </div>
                            <button className="btn_submit_doctor" type="submit">
                                {editId ? 'Update Doctor' : 'Add Doctor'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Doctor;