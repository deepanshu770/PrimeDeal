import { Link, useNavigate } from "react-router-dom";
import FilterPage from "../components/FilterPage";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Ghost, MapPin } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { useShopStore } from "@/zustand/useShopStore";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

const AdminStore = () => {
  //   const params = useParams();
  //   const [searchQuery, setSearchQuery] = useState<string>(params.text || "");
  //   const searchedShop = useShopStore((state) => state.searchedShop);
  //   const searchShop = useShopStore((state) => state.searchShop);
  const { loading, shop, getShop } = useShopStore();
  const navigate = useNavigate();
  useEffect(() => {
    // searchShop(params.text!, searchQuery);
    getShop();
  }, []);

  //   // 🔹 Function to trigger search
  //   const handleSearch = () => {
  //     if (searchQuery.trim() !== "") {
  //       debounce(() => searchShop(params.text!, searchQuery), 1500);
  //     }
  //   };
  const editShop = (id: number) => {
    navigate(`/admin/store/${id}`);
  };
  const viewProduct = (id: number) => {
    navigate(`/admin/store/product/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        <FilterPage />
        <div className="flex-1">
          {/* Search Input Field */}
          {/* <div className="flex items-center gap-2 mb-6">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for nearby shops"
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
            />
            </div> */}
          <Link to={"new"}>
            <Button
              //   onClick={handleSearch}
              className="bg-brandOrange text-white hover:bg-opacity-90 px-6 py-2 rounded-lg"
            >
              Add Store
            </Button>
          </Link>

          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 my-3">
              <h1 className="text-lg font-medium">
                {shop.length} Search Shops(s) found
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {loading ? (
                <SkeletonCard />
              ) : !loading && shop && shop.length == 0 ? (
                <NoResultFound searchQuery={""} />
              ) : (
                shop?.map((shop) => (
                  <Card
                    key={shop.id}
                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative">
                      <AspectRatio ratio={16 / 9}>
                        <img
                          src={shop.storeBanner || ""}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>

                      <div className="absolute top-0 right-0 bg-white dark:bg-gray-700 bg-opacity-75 rounded-bl-lg py-1 px-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
                          Featured
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h1 className="text-2xl font-extrabold text-white drop-shadow-md">
                          {shop.storeName}
                        </h1>
                      </div>
                    </div>

                    <CardContent className="p-4 pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin size={20} className="text-brandGreen" />
                          <p className="text-sm ml-2 font-medium">
                            {shop.city}
                          </p>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 border-t gap-4 dark:border-t-gray-700 border-t-gray-100 flex justify-center">
                      <Button
                        onClick={() => editShop(shop.id)}
                        className="bg-brandGreen text-white hover:bg-opacity-90 font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200 w-full"
                      >
                        Edit Shop
                      </Button>
                      <Button
                        onClick={() => viewProduct(shop.id)}
                        className="bg-brandOrange text-white hover:bg-opacity-90 font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200 w-full"
                      >
                        View Products
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStore;

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
