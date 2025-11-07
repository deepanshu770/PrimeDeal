import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Ghost } from "lucide-react";
import { useShopStore } from "@/zustand/useShopStore";
import debounce from "lodash/debounce";
import ShopCard from "./ShopCard";
import FilterPage from "./FilterPage";

const Nearby = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { nearbyShops, getNearbyShops, loading } = useShopStore();

  // 🧭 Fetch nearby shops on mount
  useEffect(() => {
    getNearbyShops(); // Default 7km radius
  }, []);

  // 🔍 Debounced input handler
  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value.trim().toLowerCase());
      }, 400),
    []
  );

  // 🔎 Filtered shops based on search text
  const filteredShops = useMemo(() => {
    if (!searchQuery) return nearbyShops;
    return nearbyShops.filter((shop) =>
      shop.storeName.toLowerCase().includes(searchQuery)
    );
  }, [nearbyShops, searchQuery]);

  // 🧭 Navigate to shop detail
  const viewOnClick = (id: number) => navigate(`/shop/${id}`);

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        {/* Optional filters sidebar */}
        <FilterPage />

        <div className="flex-1">
          {/* 🔍 Search Input */}
          <div className="flex items-center gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search for nearby shops"
              onChange={(e) => debouncedSetSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
            />
            <Button
              onClick={() => getNearbyShops()}
              className="bg-brandOrange text-white hover:bg-hoverOrange px-6 py-2 rounded-lg"
            >
              Refresh
            </Button>
          </div>

          {/* 🏬 Results */}
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 my-3">
              <h1 className="text-lg font-medium text-textPrimary dark:text-white">
                {filteredShops.length} nearby shop
                {filteredShops.length !== 1 ? "s" : ""} found
              </h1>
            </div>

            {/* 🧱 Shop Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {loading ? (
                <SkeletonCard />
              ) : filteredShops.length === 0 ? (
                <NoResultFound searchQuery={searchQuery} />
              ) : (
                filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    viewOnClick={viewOnClick}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nearby;

/* -------------------- Skeletons -------------------- */
const SkeletonCard = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
        >
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
};

/* -------------------- No Results -------------------- */
const NoResultFound = ({ searchQuery }: { searchQuery: string }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Ghost className="w-20 h-20 text-gray-400 dark:text-gray-500 animate-float mb-4" />
      <div>
        <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
          No shops found nearby
        </h1>
        {searchQuery && (
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No results for “
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {searchQuery}
            </span>
            ”. Try another name.
          </p>
        )}
      </div>
    </div>
  );
};
