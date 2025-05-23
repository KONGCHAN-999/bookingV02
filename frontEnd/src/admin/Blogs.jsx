import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import './css/Blogs.css';
import { LuPencil } from "react-icons/lu";

function Blogs() {
    const [blogs, setBlogs] = useState({
        title: '',
        author: '',
        publishDate: '',
        content: ''
    });

    const [getBlogData, setGetBlogData] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);

    // New states for image handling
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const API_URL = 'http://localhost:3000/api/blog/';

    // Format date to YYYY-MM-DD for input fields
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    // Handle files (from input or drag & drop)
    const handleFiles = (files) => {
        const validFiles = files.filter(file => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return false;
            }
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum size is 5MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setSelectedImages(prev => [...prev, ...validFiles]);

            // Create preview URLs
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(prev => [...prev, {
                        file: file,
                        url: e.target.result,
                        name: file.name
                    }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Remove image from selection
    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            handleFiles(files);
        }
    };

    // Clear form and images
    const clearForm = () => {
        setBlogs({
            title: '',
            author: '',
            publishDate: '',
            content: ''
        });
        setSelectedImages([]);
        setImagePreview([]);
        setEditId(null);
    };

    // Fetch blog data from MongoDB via backend API
    useEffect(() => {
        const fetchBlogData = async () => {
            try {
                const response = await axios.get(API_URL);
                if (response.data.blogs) {
                    setGetBlogData(response.data.blogs);
                } else if (Array.isArray(response.data)) {
                    setGetBlogData(response.data);
                } else {
                    console.error('Unexpected API response format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };
        fetchBlogData();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            clearForm();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!blogs.title || !blogs.author) {
            alert('Title and author are required!');
            return;
        }

        setIsUploading(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('title', blogs.title);
            formData.append('author', blogs.author);
            formData.append('publishDate', blogs.publishDate || new Date().toISOString().split('T')[0]);
            formData.append('content', blogs.content);

            // Add images to FormData
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            let response;
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editId) {
                // Update existing blog
                console.log(`Updating blog with ID: ${editId}`);
                const updateUrl = API_URL.endsWith('/') ? `${API_URL}${editId}/multiple` : `${API_URL}/${editId}/multiple`;
                console.log(`Using URL: ${updateUrl}`);

                response = await axios.put(updateUrl, formData, config);

                const updatedBlog = response.data.blog || response.data;

                setGetBlogData((prev) =>
                    prev.map((blog) =>
                        blog._id === editId ? updatedBlog : blog
                    )
                );
                alert('Blog updated successfully!');
            } else {
                // Add new blog - use multiple images endpoint if images are selected
                const endpoint = selectedImages.length > 0 ? `${API_URL}multiple` : API_URL;
                response = await axios.post(endpoint, formData, config);

                const newBlog = response.data.blog || response.data;

                setGetBlogData((prev) => [
                    ...prev,
                    { ...newBlog, id: newBlog._id },
                ]);
                alert('Blog added successfully!');
            }

            toggleSidebar();
            clearForm();
        } catch (error) {
            console.error('Error saving blog:', error);
            alert('Error saving blog: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlogs((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const openPopup = (id) => {
        setSelectedBlogId(id);
        setShowPopup(true);
    };

    const closePopup = () => {
        setSelectedBlogId(null);
        setShowPopup(false);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}`);
            setGetBlogData((prev) => prev.filter((blog) => blog._id !== id));
            alert('Blog deleted successfully!');
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Error deleting blog: ' + (error.response?.data?.message || error.message));
        }
    };

    const confirmDelete = () => {
        if (selectedBlogId) {
            handleDelete(selectedBlogId);
        }
        closePopup();
    };

    const handleUpdate = (blog) => {
        setEditId(blog._id);
        setBlogs({
            title: blog.title || '',
            author: blog.author || '',
            publishDate: formatDateForInput(blog.publishDate) || '',
            content: blog.content || ''
        });

        // Clear previous images when editing
        setSelectedImages([]);
        setImagePreview([]);

        setIsSidebarOpen(true);
    };

    const handleDetail = (blog) => {
        setSelectedBlog(blog);
        setShowDetailPopup(true);
    };

    const closeDetailPopup = () => {
        setSelectedBlog(null);
        setShowDetailPopup(false);
    };

    // Truncate text for table display
    const truncateText = (text, maxLength = 30) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Render blog images
    const renderBlogImages = (blog) => {
        const images = [];

        // Add single image (backward compatibility)
        if (blog.file) {
            images.push(`http://localhost:3000/uploads/${blog.file}`);
        }

        // Add multiple images
        if (blog.files && blog.files.length > 0) {
            blog.files.forEach(file => {
                images.push(`http://localhost:3000/uploads/${file.filename}`);
            });
        }

        return images;
    };

    // Remove image preview
    const removeImagePreview = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setDoctors(prev => ({ ...prev, image: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <Dashboard />
            <div className="container_admin">
                <div className="box-list-blogs">
                    <div className="blog-list-header">
                        <h1>Blog Management</h1>
                        <button className="add-blog-button" onClick={toggleSidebar}>
                            <i className="bx bx-plus"></i>
                            Add Blog
                        </button>
                    </div>

                    <table className="blog-list-table">
                        <thead>
                            <tr>
                                <th scope="col">Title</th>
                                <th scope="col">Author</th>
                                <th scope="col">Date</th>
                                <th scope="col">Images</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getBlogData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-blogs-message">No blogs found. Add your first blog!</td>
                                </tr>
                            ) : (
                                getBlogData.map((blog) => {
                                    const blogImages = renderBlogImages(blog);
                                    return (
                                        <tr key={blog._id}>
                                            <td>{truncateText(blog.title)}</td>
                                            <td>{blog.author}</td>
                                            <td>{formatDateForDisplay(blog.publishDate)}</td>
                                            <td>
                                                <div className="blog-images-preview">
                                                    {blogImages.length > 0 ? (
                                                        <>
                                                            <img
                                                                src={blogImages[0]}
                                                                alt="Blog preview"
                                                                className="table-image-preview"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                            {blogImages.length > 1 && (
                                                                <span className="image-count">+{blogImages.length - 1}</span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="no-images">No images</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="edit-button"
                                                        onClick={() => handleUpdate(blog)}
                                                        aria-label={`Edit ${blog.title}`}
                                                    >
                                                        <LuPencil />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => openPopup(blog._id)}
                                                        aria-label={`Delete ${blog.title}`}
                                                    >
                                                        <i className="bx bx-trash"></i>
                                                        Delete
                                                    </button>
                                                    <button
                                                        className="view-button"
                                                        onClick={() => handleDetail(blog)}
                                                        aria-label={`View ${blog.title}`}
                                                    >
                                                        <i className="bx bx-show"></i>
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Popup */}
                {showPopup && (
                    <div className="popup_delete">
                        <div className="popup_delete_content">
                            <h3>Are you sure you want to delete this blog post?</h3>
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

                {/* Blog Detail Popup */}
                {showDetailPopup && selectedBlog && (
                    <div className="popup_detail">
                        <div className="popup_detail_content">
                            <div className="detail_header">
                                <h2>Blog Details</h2>
                                <button className="button_close" onClick={closeDetailPopup}>
                                    <i className="bx bx-x"></i>
                                </button>
                            </div>
                            <div className="detail_body">
                                <div className="detail_item blog-title">
                                    <h3>Title</h3>
                                    <p>{selectedBlog.title || 'Untitled'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Author</h3>
                                    <p>{selectedBlog.author || 'Anonymous'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Publish Date</h3>
                                    <p>{formatDateForDisplay(selectedBlog.publishDate)}</p>
                                </div>

                                {/* Display Blog Images */}
                                {(() => {
                                    const blogImages = renderBlogImages(selectedBlog);
                                    return blogImages.length > 0 && (
                                        <div className="detail_item full-width">
                                            <h3>Images ({blogImages.length})</h3>
                                            <div className="blog-images-gallery">
                                                {blogImages.map((imageUrl, index) => (
                                                    <div key={index} className="blog-image-container">
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Blog image ${index + 1}`}
                                                            className="blog-image-full"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="detail_item full-width">
                                    <h3>Content</h3>
                                    <div className="blog-content">
                                        {selectedBlog.content || 'No content available'}
                                    </div>
                                </div>
                            </div>
                            <div className="detail_footer">
                                <button className="btn_edit" onClick={() => {
                                    closeDetailPopup();
                                    handleUpdate(selectedBlog);
                                }}>
                                    Edit this blog
                                </button>
                                <button className="btn_close" onClick={closeDetailPopup}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Blog Sidebar */}
                {isSidebarOpen && (
                    <div className="box_form_addBlog">
                        <div className="box_group_title">
                            <div></div>
                            <h1>{editId ? 'Edit Blog' : 'Add New Blog'}</h1>
                            <button className="button_close" onClick={toggleSidebar}>
                                <i className="bx bx-x"></i>
                            </button>
                        </div>
                        <form onSubmit={(e) => handleSubmit(e, imagePreview)} className="form_addBlog">
                            <div className="form-group">
                                <label htmlFor="title">Title:</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={blogs.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="author">Author:</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    value={blogs.author}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="publishDate">Publish Date:</label>
                                <input
                                    type="date"
                                    id="publishDate"
                                    name="publishDate"
                                    value={blogs.publishDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="content">Content:</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={blogs.content}
                                    onChange={handleChange}
                                    rows="10"
                                    required
                                ></textarea>
                            </div>

                            {/* Image Upload Section */}
                            <div className="form-group">
                                <label htmlFor="images">Images:</label>
                                <div
                                    className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        id="images"
                                        name="images"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="image-input-hidden"
                                        style={{ display: 'none' }}
                                    />
                                    <div className="upload-content">
                                        <i className="bx bx-cloud-upload upload-icon"></i>
                                        <p>Drag and drop images here or click to select</p>
                                        <p className="upload-info">Maximum 10 images, 5MB each</p>
                                        <button
                                            type="button"
                                            className="select-files-btn"
                                            onClick={() => document.getElementById('images').click()}
                                        >
                                            Select Images
                                        </button>
                                    </div>
                                </div>

                                {/* Image Preview */}
                                {imagePreview.length > 0 && (
                                    <div className="image-preview-container">
                                        <h4>Selected Images ({imagePreview.length})</h4>
                                        <div className="image-preview-grid">
                                            {imagePreview.map((preview, index) => (
                                                <div key={index} className="image-preview-item">
                                                    <img src={preview.url} alt={preview.name} />
                                                    <div className="image-preview-overlay">
                                                        <button
                                                            type="button"
                                                            className="remove-image-btn"
                                                            onClick={() => removeImage(index)}
                                                            title="Remove image"
                                                        >
                                                            <i className="bx bx-x"></i>
                                                        </button>
                                                    </div>
                                                    <p className="image-name">{truncateText(preview.name, 20)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* selected Image Preview show for edit */}
                                {editId && imagePreview.length === 0 && (
                                    <div className="image-preview-container">
                                        <h4>Current Images</h4>
                                        <div className="image-preview-grid">
                                            {renderBlogImages(getBlogData.find(blog => blog._id === editId)).map((imageUrl, index) => (
                                                <div key={index} className="image-preview-item">
                                                    <img src={imageUrl} alt={`Current image ${index + 1}`} />
                                                </div>
                                            ))}
                                            {/* <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removeImage(index)}
                                                title="Remove image"
                                            >
                                                <i className="bx bx-x"></i>
                                            </button> */}
                                        </div>

                                    </div>
                                )}

                            </div>

                            <button className="btn_submit_blog" type="submit" disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <i className="bx bx-loader-alt rotating"></i>
                                        {editId ? 'Updating...' : 'Adding...'}
                                    </>
                                ) : (
                                    editId ? 'Update Blog' : 'Add Blog'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Blogs;