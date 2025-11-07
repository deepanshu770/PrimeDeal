import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { MapPin, Clock, Package, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";

interface ShopCardProps {
  shop: {
    id: number;
    storeName: string;
    storeBanner?: string;
    city: string;
    address: string;
    deliveryTime: number;
    distance?: string | number;
    totalProducts?: number;
    owner?: {
      fullname: string;
      email?: string;
    };
  };
  viewOnClick: (id: number) => void;
}

function ShopCard({ shop, viewOnClick }: ShopCardProps) {
  // 🧩 Fallbacks to prevent crashes
  const banner =
    shop.storeBanner ||
    "https://placehold.co/600x400?text=Shop+Banner";
  const storeName = shop.storeName || "Unnamed Shop";
  const city = shop.city || "Unknown City";
  const address = shop.address || "No address available";
  const deliveryTime = shop.deliveryTime || 20;
  const distance =
    typeof shop.distance === "string"
      ? parseFloat(shop.distance)
      : shop.distance;
  const ownerName = shop.owner?.fullname || "N/A";

  return (
    <Card
      key={shop.id}
      className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 
      hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* 🖼️ Banner Section */}
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <img
            src={banner}
            alt={storeName}
            className="w-full h-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
          />
        </AspectRatio>

        {/* 🧾 Overlay Gradient */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate drop-shadow">
            {storeName}
          </h1>
        </div>
      </div>

      {/* 📍 Info Section */}
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Location + Distance */}
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="text-brandGreen w-4 h-4" />
            <span className="truncate">{city}</span>
          </div>

          {distance && (
            <span className="text-xs font-semibold text-brandGreen bg-brandGreen/10 px-2 py-1 rounded-full">
              {distance.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {address}
        </p>

        {/* Delivery + Products */}
        <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-brandOrange" />
            <span>{deliveryTime} min delivery</span>
          </div>

          {shop.totalProducts !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-blue-500" />
              <span>{shop.totalProducts} items</span>
            </div>
          )}
        </div>

        {/* Owner info (optional) */}
        {shop.owner && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mt-1">
            <User className="w-4 h-4 text-gray-400" />
            <span className="truncate">{ownerName}</span>
          </div>
        )}
      </CardContent>

      {/* 🔘 Footer Button */}
      <CardFooter className="p-4 pt-0 flex justify-center">
        <Button
          onClick={() => viewOnClick(shop.id)}
          className="w-full bg-brandGreen text-white font-semibold py-2 rounded-lg hover:bg-brandGreen/90 shadow-md hover:shadow-lg transition-all duration-200"
        >
          View Products
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ShopCard;
