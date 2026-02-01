import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const fetchProducts = useCallback(async () => {
    try {
      const params = category ? { category } : {};
      const response = await axios.get('http://localhost:5000/api/products', { params });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getCategoryName = (cat) => {
    return cat === 'renal' ? 'Renal' : 'Prostate Cancer';
  };

  const getKitTypeName = (type) => {
    return type === 'family' ? 'Family Kit' : 'Individual Kit';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>

      <div className="mb-6 flex gap-4">
        <a
          href="/products"
          className={`px-4 py-2 rounded-md ${!category ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          All Products
        </a>
        <a
          href="/products?category=renal"
          className={`px-4 py-2 rounded-md ${category === 'renal' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Renal
        </a>
        <a
          href="/products?category=prostate_cancer"
          className={`px-4 py-2 rounded-md ${category === 'prostate_cancer' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Prostate Cancer
        </a>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                </div>
                <p className="text-sm text-primary-600 mb-2">
                  {getCategoryName(product.category)} • {getKitTypeName(product.kit_type)}
                </p>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">${product.price}</span>
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Individual Kit</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">$10</p>
            <p className="text-gray-600">Perfect for individual use</p>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Family Kit</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">$30</p>
            <p className="text-gray-600">Ideal for family use</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
