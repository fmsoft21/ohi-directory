"use client";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { ProductCardImage } from "./OptimizedImages";

const ProductCard = ({ product }) => {
  // Get the first image or fallback
  const imageUrl = product?.images?.[0] || '/image.png';

  return (
    <div>
      <Link
        href={`/products/${product._id}`}
        className="block rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm shadow-indigo-100 dark:shadow-gray-700 hover:shadow-lg transition-shadow duration-300"
      >
        {/* Optimized Image with ImageKit CDN */}
        <ProductCardImage
          src={imageUrl}
          alt={product?.title || 'Product'}
          className="w-full h-[250px] rounded-t-lg object-cover"
        />

        <div className="mt-2 p-4">
          <div className="flex flex-row justify-between items-start">
            <dl className="flex-1">
              <div>
                <dt className="sr-only">Price</dt>
                <dd className="text-sm text-gray-500 dark:text-gray-400">
                  {product?.discountPercentage > 0 && (
                    <span className="line-through mr-2 text-gray-400">
                      R {product?.price}
                    </span>
                  )}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                    R {product?.discountPercentage > 0 
                      ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
                      : product?.price
                    }
                  </span>
                  {product?.discountPercentage > 0 && (
                    <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded">
                      -{product.discountPercentage}% OFF
                    </span>
                  )}
                </dd>
              </div>

              <div className="mt-2">
                <dt className="sr-only">Product Title</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                  {product?.title}
                </dd>
              </div>

              {/* Rating */}
              {product?.rating > 0 && (
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-yellow-500">
                    {"★".repeat(Math.round(product.rating))}
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">
                    ({product.rating})
                  </span>
                </div>
              )}

              {/* Stock Status */}
              <div className="mt-2">
                {product?.stock > 0 ? (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    Out of Stock
                  </span>
                )}
              </div>
            </dl>

            <Button 
              className="rounded-full bg-zinc-100 hover:bg-zinc-200 p-3 ml-2 mt-12" 
              disabled={product?.stock === 0}
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic here
                console.log('Add to cart:', product._id);
              }}
            >
              <ShoppingCart className="text-gray-600 dark:text-gray-400 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;