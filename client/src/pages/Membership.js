import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Membership = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    membership_type: 'individual',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would integrate with a payment gateway here
      // For now, we'll simulate payment with a mock payment_id
      const payment_id = `pay_${Date.now()}`;

      const response = await axios.post('http://localhost:5000/api/memberships/register', {
        ...formData,
        payment_id,
      });

      localStorage.setItem('token', response.data.token);
      toast.success('Membership registration successful!');
      navigate('/');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Membership</h1>
        <p className="text-gray-600 mb-8">Register to access exclusive benefits and treatments</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`border-2 rounded-lg p-6 cursor-pointer transition ${
            formData.membership_type === 'individual' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
          }`} onClick={() => setFormData({ ...formData, membership_type: 'individual' })}>
            <h3 className="text-xl font-semibold mb-2">Individual Membership</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">$10</p>
            <p className="text-gray-600 text-sm">Registration fee for individual membership</p>
          </div>
          <div className={`border-2 rounded-lg p-6 cursor-pointer transition ${
            formData.membership_type === 'family' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
          }`} onClick={() => setFormData({ ...formData, membership_type: 'family' })}>
            <h3 className="text-xl font-semibold mb-2">Family Membership</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">$30</p>
            <p className="text-gray-600 text-sm">Registration fee for family membership</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Payment:</strong> You will be redirected to a secure payment page after registration. 
              Credit card payment is required for membership activation.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Register & Pay $${formData.membership_type === 'family' ? '30' : '10'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Membership;
