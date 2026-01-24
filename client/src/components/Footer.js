import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Herbal Products</h3>
            <p className="text-gray-400 text-sm">
              Natural healing through herbal medicine. Free consultations and expert treatments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/consultation" className="hover:text-white">Consultation</Link></li>
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/membership" className="hover:text-white">Membership</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products?category=renal" className="hover:text-white">Renal Treatment</Link></li>
              <li><Link to="/products?category=prostate_cancer" className="hover:text-white">Prostate Cancer</Link></li>
              <li><Link to="/testimonials" className="hover:text-white">Testimonials</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@herbalproducts.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>24/7 Emergency Support</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Herbal Products. All rights reserved.</p>
          <p className="mt-2">
            <Link to="#" className="hover:text-white">Privacy Policy</Link> | 
            <Link to="#" className="hover:text-white ml-2">Terms of Service</Link> | 
            <Link to="#" className="hover:text-white ml-2">Medical Disclaimer</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
