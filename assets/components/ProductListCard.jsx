"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/assets/contexts/CartContext";
import { toast } from "@/components/hooks/use-toast";

const formatPrice = (value) => {
  const price = Number(value) || 0;
  return price.toFixed(2);
};

const ProductListCard = ({ product = {} }) => {
  const imageUrl = product?.images?.[0] || "/image.png";
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const discountedPrice = product?.discountPercentage
    ? (Number(product.price) || 0) * (1 - product.discountPercentage / 100)
    : Number(product?.price) || 0;

  const handleAddToCart = async () => {
    if (!product?._id) {
      toast({
        variant: "destructive",
        title: "Unable to add",
        description: "Product ID missing",
      });
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id, 1);
      toast({
        variant: "success",
        title: "Added to cart",
        description: `${product.title || "Product"} added to cart`,
      });
    } catch (error) {
      console.error("Error adding to cart", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add to cart",
      });
    } finally {
      setAdding(false);
    }
  };

  const rating = Number(product?.rating) || 0;

  return (
    <Card className="overflow-hidden border-none bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm hover:shadow-md hover:ring-2 hover:ring-emerald-500 transition-all">
      <div className="flex flex-row gap-3 p-4 sm:gap-4 sm:p-6">
        {/* Image Section - Smaller on mobile */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-lg sm:rounded-2xl overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={product?.title || "Product"}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3 ml-4 sm:gap-4 min-w-0">
          <div className="flex-1">
            <div className="flex flex-wrap sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 sm:mb-2">
              {product?.ownerName && (
                <span className="px-2 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  {product.ownerName}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
              {product?.title || "Untitled Product"}
            </h3>

            {product?.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3">
                {product.description}
              </p>
            )}

            

            <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm">
              <div>
                <div className="hidden sm:block text-xs uppercase text-gray-500 dark:text-gray-400">Price</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  R {formatPrice(discountedPrice)}
                </div>
                {product?.discountPercentage > 0 && (
                  <div className="text-xs text-red-500 line-through">
                    R {formatPrice(product.price)}
                  </div>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs uppercase text-gray-500 dark:text-gray-400">Stock</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product?.stock ?? 0}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xs uppercase text-gray-500 dark:text-gray-400">Rating</div>
                <div className="flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-white">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {rating > 0 ? rating.toFixed(1) : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Horizontal on mobile, vertical on desktop */}
          <div className="flex sm:flex-col gap-2 mt-auto sm:my-auto">
            <Link href={`/products/${product?._id || ""}`} className="sm:flex-none">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={adding || product?.stock === 0}
              className="sm:flex-none border border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-emerald-400"
              variant="outline"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductListCard;
