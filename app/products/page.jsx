"use client";
import ProductCard from "@/assets/components/ProductCard";
import React from "react";
import Loading from "@/app/loading";
import { useProducts } from "@/assets/hooks/useProductsHook";
import FilterAndSort from "@/assets/components/FilterAndSort";
import ShopByCategory from "@/assets/components/ShopByCategory";
import Image from "next/image";

const ProductsPage = () => {
  const { products, loading, error } = useProducts();

  if (loading) return <Loading data-oid="pzds3qp" />;
  if (error) return <div data-oid="bo4bvh8">Error: {error}</div>;

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
    <section className="bg-radial-[at_bottom] from-zinc-900/30  to-emerald-800/30">
      <div className="relative isolate overflow-hidden pb-10 -mt-8 sm:py-20">
      <Image
        height={1500}
        width={2830}
        alt=""
        src="/background.jpg"
        className="absolute inset-0 -z-10 size-full object-cover object-right md:object-center"
      />
        <div className="absolute inset-0 -z-10 bg-white/10 dark:bg-black/80 backdrop-blur-md"></div>

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

      <ShopByCategory />

      <div className="m-4 rounded-lg p-4" data-oid="4z4mxwh">
        <FilterAndSort products={products} />
      </div>
    </section>
  );
};

export default ProductsPage;
