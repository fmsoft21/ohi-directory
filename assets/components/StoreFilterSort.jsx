"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

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
  const [filters, setFilters] = useState({
    search: "",
    province: "",
    city: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const mounted = useRef(false);

  // Debounce search input so we don't call parent on every keystroke instantly
  useEffect(() => {
    const handler = setTimeout(() => {
      // don't call on initial mount (parent already fetches once)
      if (mounted.current) onFilterChange({ ...filters });
    }, 300);

    return () => clearTimeout(handler);
    // only watch search specifically so other changes don't retrigger this debounce
  }, [filters.search]);

  // Immediately notify parent when province, sortBy or sortOrder change
  useEffect(() => {
    if (!mounted.current) return; // skip initial mount
    onFilterChange({ ...filters });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.province, filters.sortBy, filters.sortOrder]);

  // mark mounted after first render
  useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    // <Card className="mb-6">
    //   <CardHeader>
    //     {/* <CardTitle className="flex items-center gap-2">
    //       <Filter className="h-5 w-5" />
    //       Filter & Sort Stores
    //     </CardTitle> */}
    //   </CardHeader>
    //   <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
          {/* Search */}
          <div className="space-y-2">
            {/* <Label htmlFor="search">Search</Label> */}
            <div className="relative">
              <Input
                id="search"
                placeholder="Search stores..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Province Filter */}
          <div className="space-y-2">
            {/* <Label htmlFor="province">Province</Label> */}
            <Select
              value={filters.province}
              onValueChange={(value) => 
                handleFilterChange("province", value === "All Provinces" ? "" : value)
              }
            >
              <SelectTrigger id="province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          {/* <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter city..."
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
            />
          </div> */}

          {/* Sort By */}
          <div className="space-y-2">
            {/* <Label htmlFor="sortBy">Sort By</Label> */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Added</SelectItem>
                <SelectItem value="storename">Store Name</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="province">Province</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          {/* <div className="space-y-2">
            <Label htmlFor="sortOrder">Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange("sortOrder", value)}
            >
              <SelectTrigger id="sortOrder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSearch}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
        </div>

    //   </CardContent>
    // </Card>
  );
};

export default StoreFilterSort;