"use client";
import { StarIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import React, { useState } from "react";
import { ProductCardImage } from "./OptimizedImages";
import { useCart } from "@/assets/contexts/CartContext";
import { toast } from "@/components/hooks/use-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ProductCard = ({ product }) => {
  // Get the first image or fallback
  const imageUrl = product?.images?.[0] || "/image.png";
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!product?._id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Product ID not found",
      });
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative rounded-lg bg-white/40 dark:bg-zinc-800/40 border border-white/40 dark:border-zinc-800/40 hover:border-emerald-600 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 p-4 sm:p-6">
      <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75 h-48 w-full">
        <Image
          width={300}
          height={256}
          src={imageUrl}
          alt={product?.title || "Product"}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="pb-4 pt-10 text-center">
        <div className=" text-xs sm:text-sm text-gray-600 dark:text-gray-400 sm:mb-2">
          {product?.ownerName && (
            <span className="px-2 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              {product.ownerName}
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          <Link href={`/products/${product._id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product?.title}
          </Link>
        </h3>
        <div className="mt-3 flex flex-col items-center">
          <p className="sr-only">{product?.rating} out of 5 stars</p>
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((rating) => (
              <StarIcon
                key={rating}
                aria-hidden="true"
                className={classNames(
                  product?.rating > rating
                    ? "text-yellow-400"
                    : "text-gray-200",
                  "h-5 w-5 flex-shrink-0"
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {product?.reviewCount || 0} reviews
          </p>
        </div>
        <p className="mt-4 text-base font-medium text-gray-900 dark:text-gray-100">
          {product?.discountPercentage > 0 && (
            <span className="line-through mr-2 text-gray-500 dark:text-gray-400">
              R {product?.price}
            </span>
          )}
          <span className="font-semibold text-emerald-600 dark:text-emerald-500">
            R{" "}
            {product?.discountPercentage > 0
              ? (
                  product.price *
                  (1 - product.discountPercentage / 100)
                ).toFixed(2)
              : product?.price}
          </span>
          {product?.discountPercentage > 0 && (
            <span className="inline-flex ml-2 text-xs bg-red-100 dark:bg-red-700 text-red-600 dark:text-red-200 px-2 py-1 rounded">
              -{product.discountPercentage}% OFF
            </span>
          )}
        </p>
        <div className="mt-6 flex justify-between">
          <Button
            className="rounded-full dark:bg-emerald-800 dark:hover:bg-emerald-700 bg-emerald-600/70 hover:bg-emerald-600/90 hover:cursor-pointer p-3 mt-4 relative z-10"
            disabled={product?.stock === 0}
            onClick={handleAddToCart}
          >
            <Eye className="text-gray-900 dark:text-gray-100 h-4 w-4" />
          </Button>
          <Button
            className="rounded-full dark:bg-zinc-800 dark:hover:bg-zinc-700 bg-zinc-100 hover:bg-zinc-200 p-3 mt-4 relative z-10 hover:cursor-pointer"
            disabled={product?.stock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="text-gray-900 dark:text-gray-100 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
