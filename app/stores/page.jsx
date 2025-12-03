'use client'
import React, { useState, useEffect } from "react";
import StoreFilterSort from "@/assets/components/StoreFilterSort";
import Loading from "@/app/loading";
import Mapbox3DStoresMap from '@/assets/components/Mapbox3DStoresMap';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stores');
        
        if (!response. ok) {
          throw new Error('Failed to fetch stores');
        }

        const data = await response.json();
        setStores(data);
        setError(null);
      } catch (err) {
        setError(err. message);
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleLike = (storeId) => {
    setStores(
      stores.map((store) => {
        if (store._id === storeId) {
          return {
            ...store,
            likes: store.isLiked ? (store.likes || 0) - 1 : (store.likes || 0) + 1,
            isLiked: ! store.isLiked,
          };
        }
        return store;
      })
    );
  };

  const handleStoreSelect = (storeId) => {
    setSelectedStoreId(storeId);
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

  return (
    <div className="bg-white dark:bg-zinc-950">
      {/* Centered Dark Panel Header */}
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Find Home Stores Near You
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Discover local businesses and connect with store owners in your area.  Browse through our curated collection of stores. 
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/dashboard/profile"
              className="rounded-md bg-white px-3. 5 py-2. 5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Register Store
            </a>
            <a href="/products" className="text-sm font-semibold leading-6 text-white">
              Browse Products <span aria-hidden="true">→</span>
            </a>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          >
            <circle r={512} cx={512} cy={512} fill="url(#stores-gradient)" fillOpacity="0. 7" />
            <defs>
              <radialGradient id="stores-gradient">
                <stop stopColor="#10B981" />
                <stop offset={1} stopColor="#059669" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogTitle className="sr-only">Stores Map</DialogTitle>
        <DialogContent className="w-screen h-[100dvh] max-h-[100dvh] max-w-none p-0 gap-0 border-none overflow-hidden">
          <div className="relative w-full h-full">
            <Button
              onClick={() => setShowMapDialog(false)}
              variant="outline"
              size="icon"
              className="absolute top-2 right-12 z-50 border-white bg-red-600/90 dark:bg-red-600 shadow-lg"
            >
              <X className="h-5 w-5 text-white" />
            </Button>
            <div className="w-full h-full">
              <Mapbox3DStoresMap 
                stores={stores} 
                onStoreSelect={(storeId) => {
                  handleStoreSelect(storeId);
                  // Don't close the dialog - let the user view the store card
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stores Grid Section */}
      <div className="container-xl lg:container m-auto p-4 sm:p-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            All Stores
          </h2>
          <a href="/products" className="hidden text-sm font-medium text-emerald-600 hover:text-emerald-500 md:block">
            Browse all products
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>

        <StoreFilterSort 
          stores={stores} 
          onLike={handleLike}
          selectedStoreId={selectedStoreId}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onMapClick={() => setShowMapDialog(true)}
        />

        <div className="mt-8 text-sm md:hidden">
          <a href="/products" className="font-medium text-emerald-600 hover:text-emerald-500">
            Browse all products
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StoresPage;