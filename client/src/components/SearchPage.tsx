import { Link, useParams } from "react-router-dom";
import FilterPage from "./FilterPage";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Ghost,MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Skeleton } from "./ui/skeleton";
import { useShopStore } from "@/zustand/useShopStore";
import { Shop } from "@/types/shopTypes";

const SearchPage = () => {
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState<string>(params.text || "");
    const { loading, searchShop, searchedShop } = useShopStore();

    useEffect(() => {
        searchShop(params.text!, searchQuery);
    }, [params.text!, searchQuery]);

    // 🔹 Function to trigger search
    const handleSearch = () => {
        if (searchQuery.trim() !== "") {
            searchShop(params.text!, searchQuery);
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
                        <Button onClick={handleSearch} className="bg-brandOrange text-white hover:bg-opacity-90 px-6 py-2 rounded-lg">Search</Button>
                    </div>
                    {/* Searched Products */}
                    <div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 my-3">
                            <h1 className="text-lg font-medium">{searchedShop?.data.length} Search result(s) found</h1>
                        </div>
                        {/*Shop cards*/}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {loading ? (
                                <SkeletonCard />
                            ) : !loading && searchedShop?.data.length == 0 ? (
                                <NoResultFound searchQuery={searchQuery} />
                            ) :
                                (
                                    searchedShop?.data.map((shop: Shop,) => (
                                        <Card key={shop.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                            <div className="relative">
                                                <AspectRatio ratio={16 / 9}>
                                                    <img src={shop.storeBanner} alt="" className="w-full h-full object-cover" />
                                                </AspectRatio>
                                                {/* Repositioned featured tag to right side */}
                                                <div className="absolute top-0 right-0 bg-white dark:bg-gray-700 bg-opacity-75 rounded-bl-lg py-1 px-3">
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-300">Featured</span>
                                                </div>

                                                {/* Shop name overlaid on the image */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                                    <h1 className="text-2xl font-extrabold text-white drop-shadow-md">{shop.name}</h1>
                                                </div>
                                            </div>

                                            <CardContent className="p-4 pt-3">
                                                <div className="flex justify-between items-center mb-3">
                                                    {/* Left-aligned location with larger icon */}
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <MapPin size={20} className="text-brandGreen" />
                                                        <p className="text-sm ml-2 font-medium">
                                                            {shop.cityName}
                                                        </p>
                                                    </div>

                                                    {/* Right-aligned ratings */}
                                                </div>

                                                {/* Categories with horizontal scrolling layout */}
                                                <div className="overflow-x-auto pb-2 -mx-1 px-1">
                                                    <div className="flex gap-2 no-wrap">
                                                        {shop.productCategory?.slice(0, 3).map((item: string, index: number) => (
                                                            <Badge
                                                                key={index}
                                                                className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                                                variant="outline"
                                                            >
                                                                {item}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>

                                            <CardFooter className="p-4 border-t dark:border-t-gray-700 border-t-gray-100 flex justify-center">
                                                {/* Centered button with increased width */}
                                                <Link to={`/shop/${shop.id}`} className="w-full max-w-xs">
                                                    <Button className="bg-brandGreen text-white hover:bg-opacity-90 font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200 w-full">
                                                        View Products
                                                    </Button>
                                                </Link>
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
                    Looks like "<span className="font-medium text-gray-700 dark:text-gray-300">{searchQuery}</span>" has vanished! <br />
                    Try searching for something else.
                </p>
            </div>
        </div>
    );
};
