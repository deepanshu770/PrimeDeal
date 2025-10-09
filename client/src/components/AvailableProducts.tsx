import { ProductItem } from "@/types/shopTypes";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useShopStore } from "@/zustand/useShopStore";
import { useCartstore } from "@/zustand/useCartstore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Package } from "lucide-react";

const AvailableProducts = ({
  products,

  showTitle = false,
}: {
  products: ProductItem[];
  showTitle?: boolean;
}) => {
  const addToCart = useCartstore((state) => state.addToCart);
  const loading = useShopStore((state) => state.loading);
  const navigate = useNavigate();
  const addToCartOnClick = (product: ProductItem) => {
    if (!product.outOfStock) {
      const added = addToCart(product, product.shopId); // ✅ Check if item was added

      if (added) {
        // ✅ Show toast only if item was added
        toast.success(
          <div>
            <span>Product added to cart</span>
            <button
              onClick={() => navigate("/cart")}
              className=" ml-10 py-1 bg-brandGreen text-white rounded-md text-sm hover:bg-brandGreen/80"
            >
              Go to Cart
            </button>
          </div>,
          { duration: 3000 } // Toast disappears after 3 sec
        );
      }
    }
  };

  return loading ? (
    <AvailableProductsSkeleton />
  ) : (
    <div className="md:p-2">
      {products.length === 0 ? (
        // ✅ Show message when no products exist
        <div className="flex flex-col items-center justify-center text-center py-10">
          <div className="bg-brandOrange/10 p-4 rounded-full">
            <Package className="h-12 w-12 text-brandOrange" />
          </div>
          <h2 className="text-2xl font-semibold text-textPrimary dark:text-white mt-4">
            This shop has no products yet!
          </h2>
          <p className="text-gray-600 mt-2 dark:text-gray-400">
            Check back later to see amazing products.
          </p>
        </div>
      ) : (
        // ✅ Show products if available, including the title
        <>
          {showTitle ? (
            <h1 className="text-xl md:text-2xl font-semibold mb-6 text-textPrimary dark:text-white">
              Available Products
            </h1>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product: ProductItem) => (
              <ProductCard
                product={product}
                addToCartOnClick={addToCartOnClick}
                key={product.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableProducts;

const ProductCard = ({
  product,
  addToCartOnClick,
}: {
  product: ProductItem;
  addToCartOnClick: (product: ProductItem) => void;
}) => (
  <Card
    key={product.id}
    className="w-full max-w-xs mx-auto shadow-lg rounded-lg overflow-hidden flex flex-col"
  >
    {/* Image - Prevents Cropping */}
    <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-contain p-2"
      />
    </div>

    {/* Product Info */}
    <CardContent className="p-4 flex-grow flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white text-left line-clamp-2">
          {product.name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-left line-clamp-3">
          {product.description}
        </p>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left mt-2">
          Net Qty: <span className="font-semibold">{product.netQty}</span>
        </h3>
      </div>

      {/* Price - Adjusted Spacing */}
      <h4 className="text-lg font-semibold text-left mt-3">
        Price: <span className="text-brandGreen">₹{product.price}</span>
      </h4>
    </CardContent>

    {/* Button Footer - Spacing Adjusted */}
    <CardFooter className="p-4 pt-3">
      <Button
        onClick={() => addToCartOnClick(product)}
        disabled={product.outOfStock}
        className={`w-full text-white px-4 py-2 rounded-md ${
          product.outOfStock
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-brandGreen hover:bg-brandGreen/80"
        }`}
      >
        {product.outOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </CardFooter>
  </Card>
);
{
  /* Skeleton for available products */
}
const AvailableProductsSkeleton = () => {
  return (
    <div className="md:p-2">
      <h1 className="text-xl md:text-2xl font-semibold mb-6 text-textPrimary">
        Available Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="w-full max-w-xs mx-auto shadow-lg rounded-lg overflow-hidden flex flex-col"
          >
            {/* Image Skeleton */}
            <Skeleton className="w-full h-40" />

            {/* Product Info Skeleton */}
            <div className="p-4 flex-grow">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </div>

            {/* Button Skeleton */}
            <div className="p-4">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
