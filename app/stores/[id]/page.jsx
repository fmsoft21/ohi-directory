"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Calendar, Store } from "lucide-react";
import ProductCard from "@/assets/components/ProductCard";
import Loading from "@/app/loading";

const StoreDetailPage = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        
        // Fetch store details
        const storeResponse = await fetch(`/api/stores/${id}`);
        if (!storeResponse.ok) throw new Error('Store not found');
        const storeData = await storeResponse.json();
        setStore(storeData);

        // Fetch store products
        const productsResponse = await fetch(`/api/products/user/${id}`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStoreData();
    }
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <div className="mt-20 p-8 text-center text-red-500">{error}</div>;
  if (!store) return <div className="mt-20 p-8 text-center">Store not found</div>;

  return (
    <div className="mt-20 min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Store Avatar */}
            <div className="relative w-32 h-32">
              <Image
                src={store.image || '/api/placeholder/150/150'}
                alt={store.storename}
                fill
                className="rounded-full border-4 border-white object-cover"
              />
            </div>

            {/* Store Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{store.storename}</h1>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-emerald-100">
                {store.city && store.province && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{store.city}, {store.province}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    <span>{store.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    About Store
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {store.about || 'No description available'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="space-y-2 text-sm">
                    {store.city && (
                      <p className="text-muted-foreground">{store.city}</p>
                    )}
                    {store.province && (
                      <p className="text-muted-foreground">{store.province}</p>
                    )}
                    {store.zipCode && (
                      <p className="text-muted-foreground">{store.zipCode}</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Member since {new Date(store.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Store Products ({products.length})
              </h2>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Store className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
                  <p className="text-muted-foreground">
                    This store hasn't listed any products yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;