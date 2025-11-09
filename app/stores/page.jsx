"use client";
import React, { useState, useEffect } from "react";
import StoreCard from "@/assets/components/StoreCard";
import StoreFilterSort from "@/assets/components/StoreFilterSort";
import Loading from "@/app/loading";
import Image from "next/image";

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStores = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.province) params.append('province', filters.province);
      if (filters.city) params.append('city', filters.city);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/stores?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleFilterChange = (filters) => {
    fetchStores(filters);
  };

  const handleLike = (storeId) => {
    setStores(
      stores.map((store) => {
        if (store._id === storeId) {
          return {
            ...store,
            likes: store.isLiked ? (store.likes || 0) - 1 : (store.likes || 0) + 1,
            isLiked: !store.isLiked,
          };
        }
        return store;
      })
    );
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="mt-20 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Stores</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }


   const links = [
  { name: 'Open roles', href: '#' },
  { name: 'Internship program', href: '#' },
  { name: 'Our values', href: '#' },
  { name: 'Meet our leadership', href: '#' },
]
const stats = [
  { name: 'Offices worldwide', value: '12' },
  { name: 'Full-time colleagues', value: '300+' },
  { name: 'Hours per week', value: '40' },
  { name: 'Paid time off', value: 'Unlimited' },
]
  return (
    <>
     <div className="relative isolate overflow-hidden bg-white dark:bg-zinc-900 py-24 sm:py-20">
          <Image
            height={1500}
            width={2830}
            alt=""
            src="https://plus.unsplash.com/premium_photo-1677456379788-82ca409e5bfc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870"
            className="absolute inset-0 -z-10 size-full object-cover object-right md:object-center opacity-50 dark:opacity-20"
          />
           <div
                className="h-10 w-2/3 bg-gradient-to-br from-emerald-500 opacity-20 blur-2xl dark:from-emerald-500 dark:invisible dark:opacity-40"
                data-oid="bjik9br"
              ></div>
              <div
                className="h-10 w-3/5 bg-gradient-to-r from-emerald-500 opacity-40 blur-2xl dark:from-emerald-500 dark:opacity-40"
                data-oid="m4g0puw"
              ></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-7xl">Products from Sellers near you</h2>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-700 dark:text-gray-300 sm:text-xl/8">
                View our collection of products carefully curated from sellers all around you. Find the perfect item that suits your needs and preferences.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base/7 font-semibold text-gray-700 dark:text-white sm:grid-cols-2 md:flex lg:gap-x-10">
                {links.map((link) => (
                  <a key={link.name} href={link.href}>
                    {link.name} <span aria-hidden="true">&rarr;</span>
                  </a>
                ))}
              </div>
              <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="flex flex-col-reverse gap-1">
                    <dt className="text-base/7 text-gray-500 dark:text-gray-300">{stat.name}</dt>
                    <dd className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
    <div className="mt-20">
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            All Stores
          </h1>
          <p className="text-muted-foreground">
            Discover local businesses and connect with store owners
          </p>
        </div>

        <StoreFilterSort onFilterChange={handleFilterChange} />

        {stores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No stores found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store._id}
                shop={{
                  id: store._id,
                  name: store.storename,
                  avatar: store.image || '/api/placeholder/50/50',
                  likes: store.likes || 0,
                  totalProducts: 0, // You can add product count later
                  isLiked: store.isLiked || false,
                  province: store.province,
                  city: store.city,
                  about: store.about,
                }}
                onLike={handleLike}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {stores.length} store{stores.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
    </>
  );
};

export default StoresPage;