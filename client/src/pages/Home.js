import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Natural Healing Through Herbal Medicine
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Free Medical Consultation • 24/7 Emergency Support • Expert Herbal Treatments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/consultation"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
              >
                Get Free Consultation
              </Link>
              <Link
                to="/products"
                className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-400 transition border-2 border-white"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">🆓</div>
              <h3 className="text-xl font-semibold mb-2">Free Medical Advice</h3>
              <p className="text-gray-600">Get expert consultation and medical advice completely free of charge.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold mb-2">Medical Emergencies Online</h3>
              <p className="text-gray-600">24/7 online support for medical emergencies and urgent consultations.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Join the Website</h3>
              <p className="text-gray-600">Become a member and access exclusive benefits and treatments.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Cyber Security</h3>
              <p className="text-gray-600">Your data is protected with industry-leading security measures.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">User Training</h3>
              <p className="text-gray-600">Comprehensive training resources to help you get the most from our services.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Wide Reach</h3>
              <p className="text-gray-600">Serving 50% of the population with accessible herbal treatments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Treatment Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-primary-600">Renal Treatment</h3>
              <p className="text-gray-600 mb-6">
                Specialized herbal treatments for renal (kidney) conditions. Our natural remedies support kidney health and function.
              </p>
              <Link
                to="/products?category=renal"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                View Renal Products →
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-primary-600">Prostate Cancer</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive herbal treatment options for prostate cancer. Natural support for your health journey.
              </p>
              <Link
                to="/products?category=prostate_cancer"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                View Prostate Cancer Products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Healing Journey?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers who have found relief through our herbal treatments.</p>
          <Link
            to="/membership"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block"
          >
            Become a Member Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
