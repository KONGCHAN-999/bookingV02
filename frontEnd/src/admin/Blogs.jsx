import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import './css/Blogs.css';
import { LuPencil } from "react-icons/lu";

function Blogs() {
    const [blogs, setBlogs] = useState({
        title: '',
        author: '',
        category: '',
        publishDate: '',
        content: '',
        tags: '',
        isPublished: false,
        image: null,
        imageFile: null
    });

    const [getBlogData, setGetBlogData] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
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

    // Fetch blog data from MongoDB via backend API
    useEffect(() => {
        const fetchBlogData = async () => {
            try {
                const response = await axios.get(API_URL);
                if (response.data.blogs) {
                    // If using the improved API response structure
                    setGetBlogData(response.data.blogs);
                } else if (Array.isArray(response.data)) {
                    // For backward compatibility
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
        setBlogs({
            title: '',
            author: '',
            category: '',
            publishDate: '',
            content: '',
            tags: '',
            isPublished: false,
            image: null,
            imageFile: null
        }); // Clear form
        setEditId(null); // Reset edit mode
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setBlogs(prev => ({
                ...prev,
                imageFile: file,
                image: imageUrl // Preview URL for UI only
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!blogs.title || !blogs.author) {
            alert('Title and author are required!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', blogs.title);
            formData.append('author', blogs.author);
            formData.append('category', blogs.category);
            formData.append('publishDate', blogs.publishDate || new Date().toISOString().split('T')[0]);
            formData.append('content', blogs.content);
            
            // Handle tags properly
            const tagsArray = blogs.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean);
            formData.append('tags', JSON.stringify(tagsArray));

            formData.append('isPublished', blogs.isPublished ? 'true' : 'false');

            // Only append image if there's a new file
            if (blogs.imageFile) {
                formData.append('image', blogs.imageFile);
            }

            let response;
            if (editId) {
                // Update existing blog
                response = await axios.put(`${API_URL}/${editId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                // Handle different response structures
                const updatedBlog = response.data.blog || response.data;
                
                setGetBlogData((prev) =>
                    prev.map((blog) =>
                        blog._id === editId ? updatedBlog : blog
                    )
                );
                alert('Blog updated successfully!');
            } else {
                // Add new blog
                response = await axios.post(API_URL, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                // Handle different response structures
                const newBlog = response.data.blog || response.data;
                
                setGetBlogData((prev) => [
                    ...prev,
                    { ...newBlog, id: newBlog._id },
                ]);
                alert('Blog added successfully!');
            }
            toggleSidebar();
        } catch (error) {
            console.error('Error saving blog:', error);
            alert('Error saving blog: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBlogs((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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
            await axios.delete(`${API_URL}/${id}`);
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
            category: blog.category || '',
            publishDate: formatDateForInput(blog.publishDate) || '',
            content: blog.content || '',
            tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
            isPublished: blog.isPublished || false,
            image: blog.image || null,
            imageFile: null
        });
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

    // Improved function to get image URL from server
    const getImageUrl = (blog) => {
        if (!blog.image) return null;
        
        // If it's a client-side preview URL (from URL.createObjectURL)
        if (typeof blog.image === 'object' || blog.image.startsWith('blob:')) {
            return blog.image;
        }
        
        // If it already starts with http, it's a full URL
        if (blog.image.startsWith('http')) {
            return blog.image;
        }
        
        // Make sure the path starts with / for server urls
        const imagePath = blog.image.startsWith('/') ? blog.image : `/${blog.image}`;
        
        // Return the full server URL
        return `http://localhost:3000${imagePath}`;
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
                                <th scope="col">Category</th>
                                <th scope="col">Date</th>
                                <th scope="col">Status</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getBlogData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-blogs-message">No blogs found. Add your first blog!</td>
                                </tr>
                            ) : (
                                getBlogData.map((blog) => (
                                    <tr key={blog._id}>
                                        <td>
                                            {blog.image && (
                                                <img
                                                    src={getImageUrl(blog)}
                                                    alt={blog.title}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                                                    onError={(e) => {
                                                        console.error("Image load failed:", blog.image);
                                                        e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                                                    }}
                                                />
                                            )}
                                            {truncateText(blog.title)}
                                        </td>
                                        <td>{blog.author}</td>
                                        <td>{blog.category || 'Uncategorized'}</td>
                                        <td>{formatDateForDisplay(blog.publishDate)}</td>
                                        <td>
                                            <span className={`status-badge ${blog.isPublished ? 'published' : 'draft'}`}>
                                                {blog.isPublished ? 'Published' : 'Draft'}
                                            </span>
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
                                ))
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
                                {selectedBlog.image && (
                                    <div className="detail_item blog-image">
                                        <img
                                            src={getImageUrl(selectedBlog)}
                                            alt={selectedBlog.title}
                                            style={{ maxWidth: '100%', height: 'auto' }}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="detail_item blog-title">
                                    <h3>Title</h3>
                                    <p>{selectedBlog.title || 'Untitled'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Author</h3>
                                    <p>{selectedBlog.author || 'Anonymous'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Category</h3>
                                    <p>{selectedBlog.category || 'Uncategorized'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Publish Date</h3>
                                    <p>{formatDateForDisplay(selectedBlog.publishDate)}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Status</h3>
                                    <p>
                                        <span className={`status-badge ${selectedBlog.isPublished ? 'published' : 'draft'}`}>
                                            {selectedBlog.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </p>
                                </div>
                                <div className="detail_item">
                                    <h3>Tags</h3>
                                    <div className="blog-tags">
                                        {Array.isArray(selectedBlog.tags) && selectedBlog.tags.length > 0 ? (
                                            selectedBlog.tags.map(tag => (
                                                <span key={tag} className="tag-badge">{tag}</span>
                                            ))
                                        ) : (
                                            <p>No tags</p>
                                        )}
                                    </div>
                                </div>
                                {selectedBlog.slug && (
                                    <div className="detail_item">
                                        <h3>Slug</h3>
                                        <p>{selectedBlog.slug}</p>
                                    </div>
                                )}
                                {selectedBlog.excerpt && (
                                    <div className="detail_item">
                                        <h3>Excerpt</h3>
                                        <p>{selectedBlog.excerpt}</p>
                                    </div>
                                )}
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
                        <form onSubmit={handleSubmit} className="form_addBlog">
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
                                <label htmlFor="category">Category:</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={blogs.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a category</option>
                                    <option value="Health">Health</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Wellness">Wellness</option>
                                    <option value="Nutrition">Nutrition</option>
                                    <option value="Fitness">Fitness</option>
                                    <option value="Mental Health">Mental Health</option>
                                    <option value="News">News</option>
                                </select>
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
                                <label htmlFor="image">Blog Image:</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {blogs.image && (
                                    <div className="image-preview">
                                        <img
                                            src={typeof blogs.image === 'string' ? 
                                                blogs.image.startsWith('blob:') || blogs.image.startsWith('http') ? 
                                                    blogs.image : 
                                                    `http://localhost:3000${blogs.image.startsWith('/') ? blogs.image : `/${blogs.image}`}` : 
                                                URL.createObjectURL(blogs.image)}
                                            alt="Preview"
                                            style={{ maxWidth: '200px', marginTop: '10px' }}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/200?text=Preview';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="tags">Tags (comma separated):</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={blogs.tags}
                                    onChange={handleChange}
                                    placeholder="health, wellness, medicine"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label htmlFor="isPublished">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        name="isPublished"
                                        checked={blogs.isPublished}
                                        onChange={handleChange}
                                    />
                                    Publish immediately
                                </label>
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
                            <button className="btn_submit_blog" type="submit">
                                {editId ? 'Update Blog' : 'Add Blog'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Blogs;