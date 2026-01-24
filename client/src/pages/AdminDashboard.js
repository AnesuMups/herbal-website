import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user || !['admin', 'demo_steward', 'demo_loans'].includes(user.role)) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, consultationsRes, testimonialsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard', { headers }),
        axios.get('http://localhost:5000/api/consultations', { headers }),
        axios.get('http://localhost:5000/api/testimonials/admin/all', { headers }),
      ]);

      setStats(statsRes.data);
      setConsultations(consultationsRes.data);
      setTestimonials(testimonialsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const updateConsultationStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/consultations/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const approveTestimonial = async (id, approved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/testimonials/${id}/approve`,
        { approved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Testimonial updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update testimonial');
    }
  };

  if (!user || !['admin', 'demo_steward', 'demo_loans'].includes(user.role)) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="mb-6 flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('consultations')}
          className={`px-4 py-2 ${activeTab === 'consultations' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
        >
          Consultations
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 ${activeTab === 'testimonials' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
        >
          Testimonials
        </button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Consultations</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.consultations}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingConsultations}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Members</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.members}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Testimonials</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.testimonials}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Orders</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.orders}</p>
          </div>
        </div>
      )}

      {activeTab === 'consultations' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {consultation.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {consultation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {consultation.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {consultation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(consultation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={consultation.status}
                        onChange={(e) => updateConsultationStatus(consultation.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {testimonial.approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{testimonial.testimonial}</p>
              <div className="flex gap-2">
                {!testimonial.approved && (
                  <button
                    onClick={() => approveTestimonial(testimonial.id, true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Approve
                  </button>
                )}
                {testimonial.approved && (
                  <button
                    onClick={() => approveTestimonial(testimonial.id, false)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Unapprove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
