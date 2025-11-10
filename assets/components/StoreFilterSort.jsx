"use client";
import React, { useState, useEffect, useRef } from "react";

const provinces = [
  "All Provinces",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West"
];

const StoreFilterSort = ({ onFilterChange }) => {
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("All Provinces");
  const [sortBy, setSortBy] = useState("createdAt");

  const mounted = useRef(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (mounted.current) {
        onFilterChange({
          search: search,
          province: province === "All Provinces" ? "" : province,
          sortBy: sortBy,
        });
      }
    }, 300);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Immediately notify parent when province or sortBy changes
  useEffect(() => {
    if (!mounted.current) return;
    onFilterChange({
      search: search,
      province: province === "All Provinces" ? "" : province,
      sortBy: sortBy,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, sortBy]);

  // Mark mounted after first render
  useEffect(() => {
    mounted.current = true;
  }, []);

  const handleReset = () => {
    setSearch("");
    setProvince("All Provinces");
    setSortBy("createdAt");
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
        <input
          aria-label="Search stores"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by store name"
          className="w-full md:w-2/3 px-3 py-2 rounded border dark:bg-zinc-900 dark:text-white bg-white text-gray-900"
        />

        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full md:w-1/6 pl-3 pr-10 py-2 rounded border dark:bg-zinc-900 dark:text-white bg-white text-gray-900"
        >
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full md:w-1/6 px-3 py-2 rounded border dark:bg-zinc-900 dark:text-white bg-white text-gray-900"
        >
          <option value="createdAt">Date Added</option>
          <option value="storename">Store Name</option>
          <option value="city">City</option>
          <option value="province">Province</option>
        </select>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default StoreFilterSort;