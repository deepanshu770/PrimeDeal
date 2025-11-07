import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useShopStore } from "@/zustand/useShopStore";
import { useCartStore } from "@/zustand/useCartStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Package, MapPin } from "lucide-react";
export interface ProductResult {
  id: number;
  name: string;
  description: string;
  image: string;
  category?: string;
  netQty: string;
  unit: string;
  price: number;
  shopName: string;
  shopId: number;
  distance: number | null;
  isAvailable?: boolean; // optional for safety
}


const AvailableProducts: React.FC<{
  products: ProductResult[];
  showTitle?: boolean;
}> = ({ products, showTitle = false }) => {
  const loading = useShopStore((s) => s.loading);
  const addToCart = useCartStore((s) => s.addToCart);
  const navigate = useNavigate();

  const handleAddToCart = (product: ProductResult) => {
    const added = addToCart(product as any); // adapt if store expects ShopInventory
    if (added) {
      toast.success(
        <div className="flex items-center justify-between w-full">
          <span>Product added to cart 🛒</span>
          <button
            onClick={() => navigate("/cart")}
            className="ml-3 px-3 py-1 bg-brandGreen text-white rounded-md text-sm hover:bg-brandGreen/80 transition"
          >
            Go to Cart
          </button>
        </div>,
        { duration: 2500 }
      );
    }
  };

  if (loading) return <AvailableProductsSkeleton />;

  return (
    <div className="md:p-2">
      {products.length === 0 ? (
        <EmptyProductState />
      ) : (
        <>
          {showTitle && (
            <h1 className="text-xl md:text-2xl font-semibold mb-6 text-textPrimary dark:text-white">
              Best Nearby Products
            </h1>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                addToCart={handleAddToCart}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableProducts;

/* -------------------- Product Card -------------------- */
const ProductCard: React.FC<{
  product: ProductResult;
  addToCart: (p: ProductResult) => void;
}> = ({ product, addToCart }) => (
  <Card className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden flex flex-col border border-border bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300">
    {/* Image */}
    <div className="relative w-full h-44 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <img
        src={product.image || "https://placehold.co/300x300?text=No+Image"}
        alt={product.name}
        className="w-full h-full object-contain p-2"
      />
      <span className="absolute top-2 right-2 bg-brandGreen text-white text-xs px-2 py-1 rounded-md shadow">
        Best Price
      </span>
    </div>

    {/* Info */}
    <CardContent className="p-4 flex-grow flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {product.name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
          {product.description}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
          <span className="font-medium">Net Qty:</span> {product.netQty}{" "}
          {product.unit}
        </p>
      </div>

      <div className="mt-4 space-y-1">
        <h4 className="text-lg font-semibold">
          Price:{" "}
          <span className="text-brandGreen">₹{product.price.toFixed(2)}</span>
        </h4>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>
            {product.shopName}
            {product.distance !== null && (
              <span className="ml-1 text-xs text-gray-400">
                ({product.distance.toFixed(1)} km away)
              </span>
            )}
          </span>
        </div>
      </div>
    </CardContent>

    {/* Button */}
    <CardFooter className="p-4 pt-3">
      <Button
        onClick={() => addToCart(product)}
        className="w-full bg-brandGreen hover:bg-brandGreen/80 text-white font-medium py-2 rounded-md transition"
      >
        Add to Cart
      </Button>
    </CardFooter>
  </Card>
);

/* -------------------- Empty & Skeleton -------------------- */
const EmptyProductState = () => (
  <div className="flex flex-col items-center justify-center text-center py-16">
    <div className="bg-brandOrange/10 p-6 rounded-full">
      <Package className="h-12 w-12 text-brandOrange" />
    </div>
    <h2 className="text-2xl font-semibold text-textPrimary dark:text-white mt-4">
      No Nearby Products Found
    </h2>
    <p className="text-gray-600 mt-2 dark:text-gray-400 max-w-md">
      We couldn’t find any available products near your area right now. Try a
      different search or expand your location radius.
    </p>
  </div>
);

const AvailableProductsSkeleton = () => (
  <div className="md:p-2">
    <h1 className="text-xl md:text-2xl font-semibold mb-6 text-textPrimary">
      Loading Products...
    </h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className="w-full max-w-xs mx-auto shadow-lg rounded-2xl overflow-hidden"
        >
          <Skeleton className="w-full h-44" />
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-3" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
          <CardFooter className="p-4">
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);
