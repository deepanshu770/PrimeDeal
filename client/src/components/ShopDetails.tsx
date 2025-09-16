import { Badge } from "./ui/badge";
import { Timer } from "lucide-react";
import AvailableProducts from "./AvailableProducts";
import { useShopStore } from "@/zustand/useShopStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

const ShopDetails = () => {
  const { singleShop, getSingleShop, loading } = useShopStore();
  const params = useParams();
  useEffect(() => {
    getSingleShop(params.id!);
  }, [params.id]);
  return loading ? (
    <ShopDetailsSkeleton />
  ) : (
    <div className="max-w-6xl mx-auto my-10 px-4">
      {/* Shop Banner Section */}
      <div className="relative w-full h-56 md:h-72 lg:h-80 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <img
          src={singleShop?.storeBanner}
          alt="Shop Banner"
          className="object-cover w-full h-full"
        />

        {/* Dark Overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Store Name - Overlaid at the Top Left */}
        <div className="absolute top-5 left-5 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            {singleShop?.name}
          </h1>
        </div>
      </div>
      {/* Shop Information Section */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Categories - Grid Layout for Better Look */}
        <div className="flex flex-wrap gap-2">
          {singleShop?.productCategory
            ?.slice(0, 4)
            .map((item: string, index: number) => (
              <Badge
                key={index}
                className="text-sm font-medium px-3 py-1 rounded-md bg-background dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-textPrimary dark:text-white hover:bg-opacity-90 transition-colors duration-200 shadow-sm"
              >
                {item}
              </Badge>
            ))}
        </div>
        {/* Delivery Time */}
        <div className="flex items-center gap-2 mt-6 md:mt-0 mr-3">
          <Timer className="w-6 h-6 text-brandGreen" />
          <h1 className="text-lg font-medium text-textPrimary dark:text-white">
            Delivery Time:{" "}
            <span className="text-textSecondary dark:text-white">
              {singleShop?.deliveryTime} mins
            </span>
          </h1>
        </div>
      </div>

      {/* Available Products Section */}
      <div className="mt-8">
        {/* <AvailableProducts products={singleShop?.products!} /> */}
        {singleShop?.products && (
          <AvailableProducts
            products={singleShop?.products!}
            shopId={singleShop.id}
          />
        )}
      </div>
    </div>
  );
};

export default ShopDetails;


const ShopDetailsSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto my-10 px-4 flex flex-col items-center text-center">
      {/* Shop Name Skeleton */}
      <Skeleton className="h-10 w-2/3 mb-4" />

      {/* Shop Banner Skeleton */}
      <Skeleton className="w-full h-52 md:h-72 lg:h-80 rounded-lg shadow-lg" />

      {/* Shop Information Section */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between w-full px-4">
        {/* Category Badges Skeleton */}
        <div className="flex flex-wrap justify-center gap-2">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-6 w-20 rounded-full" />
          ))}
        </div>

        {/* Delivery Time Skeleton */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Available Products Skeleton */}
      <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};
