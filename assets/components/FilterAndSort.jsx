import React from 'react';
import ProductCard from '@/assets/components/ProductCard';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Reusable FilterAndSort component
// Props:
// - products: array of product objects
// - renderResults?: optional function(filteredProducts) -> JSX to render results (default: grid of ProductCard)
export default function FilterAndSort({ products = [], renderResults }) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [sort, setSort] = React.useState('latest');

  const categories = React.useMemo(() => {
    if (!products) return ['all'];
    const setCats = new Set(
      products.map((p) => (p.category ? String(p.category) : 'Uncategorized'))
    );
    return ['all', ...Array.from(setCats)];
  }, [products]);

  // Capitalize helper for display labels (preserve original value for filtering)
  const capitalize = (s) => {
    if (!s || typeof s !== 'string') return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const filteredProducts = React.useMemo(() => {
    if (!products) return [];

    let list = products.slice();

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || p.name || '')
            .toString()
            .toLowerCase()
            .includes(q) ||
          (p.description || '')
            .toString()
            .toLowerCase()
            .includes(q)
      );
    }

    if (category !== 'all') {
      list = list.filter((p) => (p.category || 'Uncategorized') === category);
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b._createdAt || 0) -
          new Date(a.createdAt || a._createdAt || 0)
      );
    }

    return list;
  }, [products, query, category, sort]);

  // Default renderer: grid of ProductCard
  const defaultRender = (items) => {
    if (!items || items.length === 0) {
      return (
        <div className="py-8 text-center text-gray-400">No products match your filters.</div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
        {items.map((p, i) => (
          <ProductCard className="bg-amber-400" key={p.id || p._id || i} product={p} />
        ))}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
        <Input
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or description"
          className="w-full md:w-2/3 px-3 py-2 rounded-md border"
        />

        <Select  value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-1/6">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className='backdrop-blur-md bg-white/50 text-zinc-900 dark:text-white dark:bg-black/50' >
            {categories.map((c) => (
              <SelectItem className='hover:bg-emerald-600 cursor-pointer' key={c} value={c}>
                {capitalize(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full md:w-1/6">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className='backdrop-blur-md bg-white/50 text-zinc-900 dark:text-white dark:bg-black/50'>
            <SelectItem className='hover:bg-emerald-600 cursor-pointer' value="latest">Newest</SelectItem>
            <SelectItem className='hover:bg-emerald-600 cursor-pointer' value="price-asc">Price: Low → High</SelectItem>
            <SelectItem className='hover:bg-emerald-600 cursor-pointer' value="price-desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => {
            setQuery('');
            setCategory('all');
            setSort('latest');
          }}
          className="px-4 py-2 rounded bg-emerald-600 text-white"
        >
          Reset
        </button>
      </div>

      {/* Render results using provided render function or default grid */}
      {renderResults ? renderResults(filteredProducts) : defaultRender(filteredProducts)}
    </div>
  );
}
