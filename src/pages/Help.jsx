import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Help = () => {
  const navigate = useNavigate();
  const [adminContact, setAdminContact] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchAdminContact = async () => {
      try {
        const response = await axios.get('https://backend-pbn5.onrender.com/api/admin/platform-settings');
        const { name, email, phone, address } = response.data.adminContact;
        setAdminContact({ name, email, phone, address });
      } catch (error) {
        console.error('Failed to fetch admin contact details:', error);
        // Handle error appropriately
      }
    };

    fetchAdminContact();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-5">
      {/* Header */}
      <div className="flex items-center bg-gray-800 p-4 shadow-md rounded-lg mb-5">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 bg-transparent text-white p-2 rounded-full hover:bg-gray-700 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h2 className="text-lg font-bold">Help & Support</h2>
      </div>

      {/* Help Section */}
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-3 text-center">Admin Contact Details</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center">
            <span className="material-icons-outlined text-purple-500 mr-3">
              person
            </span>
            <span>Name: {adminContact.name}</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons-outlined text-blue-500 mr-3">
              email
            </span>
            <span>Email: {adminContact.email}</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons-outlined text-green-500 mr-3">
              phone
            </span>
            <span>Phone: {adminContact.phone}</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons-outlined text-yellow-500 mr-3">
              location_on
            </span>
            <span>Address: {adminContact.address}</span>
          </div>
        </div>
      </div>

      {/* Additional Support Section */}
      <div className="mt-5 bg-gray-800 p-5 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-3">Need Further Assistance?</h3>
        <p className="text-sm text-gray-300">
          If you have any queries or need further assistance, feel free to contact us at the above details. Our team is available 24/7 to help you.
        </p>
        <button
          onClick={() => navigate("/contact")}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg shadow-lg text-sm font-bold transition duration-300"
        >
          Contact Support
        </button>
      </div>

      {/* WhatsApp Button */}
      <div className="mt-5 flex justify-center">
        <a
          href={`https://wa.me/${adminContact.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          <i className="fab fa-whatsapp text-2xl"></i>
          <span>Chat with Us on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default Help;
