import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/login.css';
import { auth, db } from '../data/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

function AddUser() {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!fullName || !age || !gender || !phone || !email || !address || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    if (!role) {
      setError('Please select a role.');
      setLoading(false);
      return;
    }
    if (isNaN(age) || age <= 0) {
      setError('Please enter a valid age.');
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          fullName,
          age: parseInt(age),
          gender,
          phone,
          email: user.email,
          address,
          role,
          createdAt: new Date().toISOString()
        });
      }
      console.log('User Registered Successfully!');
      navigate('/dctoradmin');

    } catch (error) {
      // Customize error messages for common cases
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters long.');
          break;
        default:
          setError(error.message);
      }
      console.error('Registration error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container_register d-flex justify-content-center align-items-center min-vh-100">
        <div className="w-50 style_conten">
          <div className="box_title">
            <h2>Add User</h2>
            <Link to="/dctoradmin">
              <i className='bx bx-x'></i>
            </Link>
          </div>
          
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          
          <form onSubmit={handleRegister} noValidate>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="age" className="form-label">Age</label>
              <input
                type="number"
                className="form-control"
                id="age"
                name="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                required
                min="1"
                disabled={loading}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                className="form-control"
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="role" className="form-label">Role</label>
              <select
                className="form-control"
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={loading}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                required
                disabled={loading}
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
                placeholder="Enter email"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                required
                disabled={loading}
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
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Add User'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddUser;