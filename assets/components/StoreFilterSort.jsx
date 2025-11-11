import React from 'react';
import StoreCard from '@/assets/components/StoreCard';

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

export default function StoreFilterSort({ stores = [], onLike, selectedStoreId }) {
  const [search, setSearch] = React.useState('');
  const [province, setProvince] = React.useState('All Provinces');
  const [sortBy, setSortBy] = React.useState('createdAt');

  const filteredStores = React.useMemo(() => {
    if (!stores) return [];

    let list = stores.slice();

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (store) =>
          (store.storename || '')
            .toString()
            .toLowerCase()
            .includes(q) ||
          (store.about || '')
            .toString()
            .toLowerCase()
            .includes(q)
      );
    }

    // Filter by province
    if (province !== 'All Provinces') {
      list = list.filter((store) => store.province === province);
    }

    // Sort stores
    if (sortBy === 'storename') {
      list.sort((a, b) => 
        (a.storename || '').localeCompare(b.storename || '')
      );
    } else if (sortBy === 'city') {
      list.sort((a, b) => 
        (a.city || '').localeCompare(b.city || '')
      );
    } else if (sortBy === 'province') {
      list.sort((a, b) => 
        (a.province || '').localeCompare(b.province || '')
      );
    } else {
      // Default: sort by createdAt (newest first)
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b._createdAt || 0) -
          new Date(a.createdAt || a._createdAt || 0)
      );
    }

    return list;
  }, [stores, search, province, sortBy]);

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
        <input
          aria-label="Search stores"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by store name or description"
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
          onClick={() => {
            setSearch('');
            setProvince('All Provinces');
            setSortBy('createdAt');
          }}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Render filtered results */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No stores found</p>
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <StoreCard
              key={store._id}
              shop={{
                id: store._id,
                name: store.storename,
                avatar: store.image || '/api/placeholder/50/50',
                likes: store.likes || 0,
                totalProducts: 0,
                isLiked: store.isLiked || false,
                province: store.province,
                city: store.city,
                about: store.about,
              }}
              onLike={onLike}
              isHighlighted={selectedStoreId === store._id}
            />
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        Showing {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}