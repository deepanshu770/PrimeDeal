import { useSearchParams } from "react-router-dom";
import FilterPage from "./FilterPage";
import { Input } from "./ui/input";
import { useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Ghost, Search } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useShopStore } from "@/zustand/useShopStore";
import debounce from "lodash/debounce";
import AvailableProducts from "./AvailableProducts";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const { searchedProduct, loading, searchShop } = useShopStore();

  // 🔹 Debounced search handler (stable)
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        searchShop(query.trim());
      }
    }, 600),
    []
  );

  // 🔹 Run search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
    return debouncedSearch.cancel;
  }, [searchQuery, debouncedSearch]);

  // 🔹 Manual search trigger (button / Enter)
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchShop(searchQuery.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        {/* Sidebar Filters */}
        <FilterPage />

        {/* Main Search Section */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-6">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for Products, Categories, or Shops..."
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
            />
            <Button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-brandOrange text-white hover:bg-hoverOrange px-6 py-2 rounded-lg"
            >
              <Search className="w-4 h-4" /> Search
            </Button>
          </div>

          {/* Search Results */}
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 my-3">
              <h1 className="text-lg font-medium">
                {searchedProduct.length} Product
                {searchedProduct.length !== 1 ? "s" : ""} found
              </h1>
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : searchedProduct.length === 0 ? (
              <NoResultFound searchQuery={searchQuery} />
            ) : (
              <AvailableProducts products={searchedProduct} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

/* -------------------- Skeleton Loader -------------------- */
const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
      >
        <Skeleton className="w-full h-48" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="p-4">
          <Skeleton className="w-full h-10 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

/* -------------------- No Result Component -------------------- */
const NoResultFound = ({ searchQuery }: { searchQuery: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh] text-center">
    <Ghost className="w-20 h-20 text-gray-400 dark:text-gray-500 animate-float mb-4" />
    <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
      Whoops! No results found
    </h1>
    <p className="mt-2 text-gray-500 dark:text-gray-400">
      Looks like "<span className="font-medium">{searchQuery}</span>" vanished.{" "}
      Try searching for something else!
    </p>
  </div>
);
