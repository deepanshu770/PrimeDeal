import {  useParams } from "react-router-dom";
import FilterPage from "./FilterPage";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Ghost } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useShopStore } from "@/zustand/useShopStore";
import debounce from "lodash/debounce";
import AvailableProducts from "./AvailableProducts";

const SearchPage = () => {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState<string>(params.text || "");
  const { searchedProduct } = useShopStore();
  const loading = useShopStore((state) => state.loading);
  const searchShop = useShopStore((state) => state.searchShop);

  useEffect(() => {
    searchShop(params.text!, searchQuery);
  }, [params.text!, searchQuery]);

  // 🔹 Function to trigger search
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      debounce(() => searchShop(params.text!, searchQuery), 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        <FilterPage />
        <div className="flex-1">
          {/* Search Input Field */}
          <div className="flex items-center gap-2 mb-6">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for Prodcucts, Categories, Shops"
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
            />
            <Button
              onClick={handleSearch}
              className="bg-brandOrange text-white hover:bg-opacity-90 px-6 py-2 rounded-lg"
            >
              Search
            </Button>
          </div>
          {/* Searched Products */}
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 my-3">
              <h1 className="text-lg font-medium">
                {searchedProduct.length} Search Product(s) found
              </h1>
            </div>
           

            {loading ? (
              <SkeletonCard />
            ) : !loading && searchedProduct.length == 0 ? (
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

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Image Placeholder */}
      <Skeleton className="w-full h-48" />

      <div className="p-4">
        {/* Shop Name Placeholder */}
        <Skeleton className="h-6 w-3/4 mb-2" />

        <div className="flex justify-between items-center mb-3">
          {/* Location Placeholder */}
          <Skeleton className="h-4 w-1/3" />
        </div>

        {/* Categories Placeholder */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>

      {/* Button Placeholder */}
      <div className="p-4 flex justify-center">
        <Skeleton className="w-full max-w-xs h-10 rounded-lg" />
      </div>
    </div>
  );
};

const NoResultFound = ({ searchQuery }: { searchQuery: string }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh] text-center">
      {/* Fun Ghost Icon */}
      <Ghost className="w-20 h-20 text-gray-400 dark:text-gray-500 animate-float mb-4" />

      {/* Text */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
          Whoops! No results found
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Looks like "
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {searchQuery}
          </span>
          " has vanished! <br />
          Try searching for something else.
        </p>
      </div>
    </div>
  );
};
