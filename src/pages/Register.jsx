import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css'; // Ensure the correct CSS path

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear errors as user types
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address.';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
    else if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Prevent API call if form is invalid

    try {
      await axios.post('https://backend-pbn5.onrender.com/api/auth/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login after registration
    } catch (error) {
      console.error('Registration failed:', error);
      alert(
        error.response?.data?.message ||
          'Error registering user. Please try again later.'
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-300 mb-2">Create an Account</h1>
        <p className="text-sm text-gray-400 mb-6">Sign up to start playing</p>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`register-input ${errors.name ? 'error' : ''} border-gray-600 text-gray-300 bg-gray-700 focus:ring-2 focus:ring-gray-500`}
            />
            {errors.name && <p className="error-text text-red-300">{errors.name}</p>}
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`register-input ${errors.email ? 'error' : ''} border-gray-600 text-gray-300 bg-gray-700 focus:ring-2 focus:ring-gray-500`}
            />
            {errors.email && <p className="error-text text-red-300">{errors.email}</p>}
          </div>
          <div className="input-group">
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`register-input ${errors.phoneNumber ? 'error' : ''} border-gray-600 text-gray-300 bg-gray-700 focus:ring-2 focus:ring-gray-500`}
            />
            {errors.phoneNumber && <p className="error-text text-red-300">{errors.phoneNumber}</p>}
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`register-input ${errors.password ? 'error' : ''} border-gray-600 text-gray-300 bg-gray-700 focus:ring-2 focus:ring-gray-500`}
            />
            {errors.password && <p className="error-text text-red-300">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2 text-gray-800 bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-4">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="font-bold text-gray-300 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
