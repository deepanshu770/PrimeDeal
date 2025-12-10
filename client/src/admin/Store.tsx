import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, PackageSearch, Plus, Store, Ghost } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopStore } from "@/zustand/useShopStore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import FilterPage from "../components/FilterPage";

/* ------------------------------------------------------------
   🏬 Admin Store Page
------------------------------------------------------------ */
const AdminStore = () => {
  const { loading, shop, getShop } = useShopStore();
  const navigate = useNavigate();

  useEffect(() => {
    getShop();
  }, []);

  const handleEditShop = (id: number) => navigate(`/admin/store/${id}`);
  const handleViewProducts = (id: number) => navigate(`/admin/store/inventory/${id}`);

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Sidebar Filter */}
        <FilterPage />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Store className="w-7 h-7 text-brandGreen" />
              My Stores
            </h1>

            <Link to="new">
              <Button className="bg-brandOrange text-white hover:bg-opacity-90 flex items-center gap-2 shadow-md">
                <Plus className="w-4 h-4" />
                Add Store
              </Button>
            </Link>
          </div>

          {/* Shop Count */}
          {!loading && (
            <p className="text-gray-600 dark:text-gray-400 mb-5">
              {shop?.length ?? 0} store{shop?.length !== 1 ? "s" : ""} found
            </p>
          )}

          {/* Grid of Shops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : shop?.length === 0 ? (
              <NoResultFound />
            ) : (
              shop.map((s) => (
                <ShopCard
                  key={s.id}
                  shop={s}
                  onEdit={() => handleEditShop(s.id)}
                  onView={() => handleViewProducts(s.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStore;


const ShopCard = ({
  shop,
  onEdit,
  onView,
}: {
  shop: any;
  onEdit: () => void;
  onView: () => void;
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
      {/* Banner */}
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <img
            src={shop.storeBanner || "/placeholder-store.jpg"}
            alt={shop.storeName}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </AspectRatio>

        {/* Overlay Gradient */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
          <h2 className="text-xl font-bold text-white">{shop.storeName}</h2>
        </div>
      </div>

      {/* Shop Info */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-brandGreen" />
            <span className="text-sm">{shop.city}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {shop.description || "No description available"}
        </p>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
        <Button
          onClick={onEdit}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-brandGreen hover:text-white transition-all"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Button>

        <Button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 bg-brandOrange text-white hover:bg-opacity-90 transition-all"
        >
          <PackageSearch className="w-4 h-4" />
          Products
        </Button>
      </CardFooter>
    </Card>
  );
};

// 💨 Skeleton Loader
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden animate-pulse">
    <Skeleton className="w-full h-40" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full mt-4 rounded-md" />
    </div>
  </div>
);

// 😶 No Results
const NoResultFound = () => (
  <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh] text-center">
    <Ghost className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
      No stores found
    </h2>
    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
      Try adding a new store or check your filters.
    </p>
  </div>
);
