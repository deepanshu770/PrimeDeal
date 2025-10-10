import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";

import { Card, CardContent, CardFooter } from "./ui/card";
import { Shop } from "@/types/types";

function ShopCard({
  shop,
  viewOnClick,
}: {
  shop: Shop;
  viewOnClick: (id: number) => void;
}) {
  return (
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
            <p className="text-sm ml-2 font-medium">{shop.city}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t dark:border-t-gray-700 border-t-gray-100 flex justify-center">
        <Button
          onClick={() => viewOnClick(shop.id)}
          className="bg-brandGreen text-white hover:bg-opacity-90 font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200 w-full"
        >
          View Products
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ShopCard;
