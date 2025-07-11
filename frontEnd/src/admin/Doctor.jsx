import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import './css/Doctor.css';
import profile01 from '../assets/images/profile01.avif';
import { LuPencil } from "react-icons/lu";
import { FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Doctor() {
    // API endpoints
    const API_URL = 'http://localhost:3000/api/doctor';
    const IMAGE_BASE_URL = "http://localhost:3000/uploads/";

    // Initial state for doctor form
    const initialDoctorState = {
        fullName: '',
        age: '',
        specialty: '',
        contact: '',
        email: '',
        education: '',
        experience: '',
        certifications: '',
        image: null
    };

    // State variables
    const [doctors, setDoctors] = useState(initialDoctorState);
    const [getDataDoctor, setGetDataDoctor] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch doctor data from API
    const fetchDoctorData = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log('Fetching doctors from:', API_URL);
            const response = await axios.get(API_URL);
            console.log('Fetched doctors:', response.data);
            setGetDataDoctor(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast.error(`Failed to fetch doctors: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    // Load doctors on component mount
    useEffect(() => {
        fetchDoctorData();
    }, [fetchDoctorData]);

    // Reset form function
    const resetForm = () => {
        setDoctors(initialDoctorState);
        setEditId(null);
        setImagePreview(null);
        setCurrentFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            resetForm();
        }
    };

    // Handle form submission (Create/Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Form Validation
        if (!doctors.fullName.trim()) {
            toast.error('Full name is required!');
            return;
        }
        
        if (!doctors.email.trim()) {
            toast.error('Email is required!');
            return;
        }
        
        if (doctors.email && !/\S+@\S+\.\S+/.test(doctors.email)) {
            toast.error('Please enter a valid email address!');
            return;
        }
        
        if (doctors.contact && !/^\+?[0-9\-\s]{10,15}$/.test(doctors.contact)) {
            toast.error('Please enter a valid contact number (10-15 digits)!');
            return;
        }
        
        setIsSubmitting(true);

        try {
            // Create FormData object to handle file uploads
            const formData = new FormData();
            
            // Add all text fields
            formData.append('fullName', doctors.fullName.trim());
            formData.append('age', doctors.age || '');
            formData.append('specialty', doctors.specialty.trim());
            formData.append('contact', doctors.contact.trim());
            formData.append('email', doctors.email.trim());
            formData.append('education', doctors.education.trim());
            formData.append('experience', doctors.experience.trim());
            formData.append('certifications', doctors.certifications.trim());
            
            // Handle image upload
            if (doctors.image) {
                formData.append('image', doctors.image);
            }

            // Log form data for debugging
            console.log('Submitting form data:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
            }

            let response;
            if (editId) {
                console.log('Updating doctor with ID:', editId);
                
                // Update existing doctor
                response = await axios.put(`${API_URL}/${editId}`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                toast.success('Doctor updated successfully!');
            } else {
                console.log('Creating new doctor');
                
                // Add new doctor
                response = await axios.post(API_URL, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                toast.success('Doctor added successfully!');
            }
            
            console.log('Server response:', response.data);
            
            // Fetch updated data to refresh the list
            await fetchDoctorData();
            toggleSidebar();
            
        } catch (error) {
            console.error('Error saving doctor:', error);
            
            // Detailed error handling
            if (error.response) {
                // Server responded with error status
                const errorMessage = error.response.data?.message || error.response.statusText;
                toast.error(`Server Error: ${errorMessage}`);
                console.error('Server error details:', error.response.data);
            } else if (error.request) {
                // Request was made but no response received
                toast.error('Network Error: Unable to connect to server');
                console.error('Network error:', error.request);
            } else {
                // Something else happened
                toast.error(`Error: ${error.message}`);
                console.error('Other error:', error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctors((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should not exceed 5MB');
                e.target.value = '';
                return;
            }
            
            // Check file type
            if (!file.type.match('image.*')) {
                toast.error('Please select an image file');
                e.target.value = '';
                return;
            }
            
            console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            setDoctors(prev => ({
                ...prev,
                image: file
            }));

            // Create preview URL for the selected image
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
        }
    };

    // Clean up image preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Remove image preview
    const removeImagePreview = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setDoctors(prev => ({...prev, image: null}));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Delete confirmation popup
    const openPopup = (id) => {
        setSelectedDoctorId(id);
        setShowPopup(true);
    };

    const closePopup = () => {
        setSelectedDoctorId(null);
        setShowPopup(false);
    };

    // Handle delete operation
    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            console.log('Deleting doctor with ID:', id);
            await axios.delete(`${API_URL}/${id}`);
            setGetDataDoctor((prev) => prev.filter((doctor) => doctor._id !== id));
            toast.success('Doctor deleted successfully!');
        } catch (error) {
            console.error('Error deleting doctor:', error);
            toast.error(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = () => {
        if (selectedDoctorId) {
            handleDelete(selectedDoctorId);
        }
        closePopup();
    };

    // Handle update operation
    const handleUpdate = (doctor) => {
        console.log('Editing doctor:', doctor);
        setEditId(doctor._id);
        setDoctors({
            fullName: doctor.fullName || '',
            age: doctor.age || '',
            specialty: doctor.specialty || '',
            contact: doctor.contact || '',
            email: doctor.email || '',
            education: doctor.education || '',
            experience: doctor.experience || '',
            certifications: doctor.certifications || '',
            image: null // We don't set the file object itself
        });

        // Store the current file path for reference
        setCurrentFile(doctor.file || null);

        // Set image preview if available
        if (doctor.file) {
            setImagePreview(`${IMAGE_BASE_URL}${doctor.file}`);
        } else {
            setImagePreview(null);
        }

        setIsSidebarOpen(true);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle detail view
    const handleDetail = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDetailPopup(true);
    };

    const closeDetailPopup = () => {
        setSelectedDoctor(null);
        setShowDetailPopup(false);
    };

    // Function to get doctor's image
    const getDoctorImage = (doctor) => {
        if (doctor.file) {
            return `${IMAGE_BASE_URL}${doctor.file}`;
        }
        return profile01; // Default image
    };
    
    // Filter doctors based on search term
    const filteredDoctors = getDataDoctor.filter(doctor => 
        doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('Current state:', {
        doctorsCount: getDataDoctor.length,
        filteredCount: filteredDoctors.length,
        isLoading,
        isSidebarOpen,
        editId,
        searchTerm
    });

    return (
        <div>
            <Dashboard />
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="container_admin">
                <div className="box-list-users">
                    <div className="user-list-header">
                        <h1>Doctor Management</h1>
                        <div className="search-add-container">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search doctors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <button className="add-user-button" onClick={toggleSidebar}>
                                <FaPlus />
                                Add Doctor
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        <>
                            {filteredDoctors.length === 0 ? (
                                <div className="no-records">
                                    <p>No doctors found. {searchTerm ? 'Try a different search term.' : 'Add your first doctor!'}</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="user-list-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Image</th>
                                                <th scope="col">Full Name</th>
                                                <th scope="col">Age</th>
                                                <th scope="col">Specialty</th>
                                                <th scope="col">Contact</th>
                                                <th scope="col">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDoctors.map((doctor) => (
                                                <tr key={doctor._id}>
                                                    <td>
                                                        <img
                                                            src={getDoctorImage(doctor)}
                                                            alt={doctor.fullName}
                                                            className="doctor-list-image"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                console.log('Image load error for:', doctor.file);
                                                                e.target.src = profile01;
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{doctor.fullName}</td>
                                                    <td>{doctor.age || 'N/A'}</td>
                                                    <td>{doctor.specialty || 'N/A'}</td>
                                                    <td>{doctor.contact || 'N/A'}</td>
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
                                                                <FaTrash />
                                                                Delete
                                                            </button>
                                                            <button
                                                                className="edit-view"
                                                                onClick={() => handleDetail(doctor)}
                                                                aria-label={`View ${doctor.fullName}`}
                                                            >
                                                                <FaEye />
                                                                View
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Delete Confirmation Popup */}
                {showPopup && (
                    <div className="popup_delete">
                        <div className="popup_delete_content">
                            <h3>Are you sure you want to delete this Doctor?</h3>
                            <p className="delete-warning">This action cannot be undone.</p>
                            <div className="popup_buttons">
                                <button className="button btn_delete" onClick={confirmDelete} disabled={isLoading}>
                                    {isLoading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button className="button btn_cancel" onClick={closePopup}>
                                    Cancel
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
                                    <img
                                        src={selectedDoctor.file ?
                                            `${IMAGE_BASE_URL}${selectedDoctor.file}` :
                                            profile01}
                                        alt={selectedDoctor.fullName}
                                        className="doctor-detail-image"
                                        onError={(e) => {
                                            e.target.src = profile01;
                                        }}
                                    />
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
                            <div className="detail_footer">
                                <button 
                                    className="edit-button" 
                                    onClick={() => {
                                        handleUpdate(selectedDoctor);
                                        closeDetailPopup();
                                    }}
                                >
                                    <LuPencil /> Edit Doctor
                                </button>
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
                                <label htmlFor="fullName">Full Name: <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={doctors.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter doctor's full name"
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
                                    placeholder="Enter doctor's age"
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
                                    placeholder="E.g. Cardiology, Neurology, etc."
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
                                    placeholder="Contact number"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email: <span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={doctors.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="doctor@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="education">Education:</label>
                                <textarea
                                    id="education"
                                    name="education"
                                    value={doctors.education}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Educational background"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="experience">Experience:</label>
                                <textarea
                                    id="experience"
                                    name="experience"
                                    value={doctors.experience}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Professional experience"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="certifications">Certifications:</label>
                                <textarea
                                    id="certifications"
                                    name="certifications"
                                    value={doctors.certifications}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Professional certifications"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="image">Doctor Image:</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                />
                                <p className="file-hint">Max size: 5MB. Formats: JPG, PNG, GIF</p>
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="preview-image"
                                        />
                                        <button 
                                            type="button" 
                                            className="remove-image"
                                            onClick={removeImagePreview}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-buttons">
                                <button 
                                    type="button" 
                                    className="btn_cancel_doctor" 
                                    onClick={toggleSidebar}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn_submit_doctor" 
                                    type="submit"
                                    disabled={isSubmitting}
                                >   
                                    {isSubmitting ? 
                                        (editId ? 'Updating...' : 'Adding...') : 
                                        (editId ? 'Update Doctor' : 'Add Doctor')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Doctor;