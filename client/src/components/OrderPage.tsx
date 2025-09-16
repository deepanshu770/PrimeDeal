import { useEffect } from "react";
import { useOrderstore } from "@/zustand/useOrderstore";
import { IndianRupee, Loader2, MapPin, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


const OrderPage = () => {
  const { orders, getOrders, loading } = useOrderstore();

  useEffect(() => {
    getOrders();
    useOrderstore.persist.clearStorage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-brandGreen animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <PackageX className="w-16 h-16 text-gray-400" />
        <h1 className="font-bold text-2xl text-gray-600 mt-4 dark:text-white">No Orders Yet!</h1>
        <p className="text-gray-500 text-sm mt-2 dark:text-gray-400">Start shopping now and fill up your basket! 🛒</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-4">
      <h1 className="text-3xl font-extrabold text-textPrimary text-center mb-8 dark:text-white">
        Your Orders
      </h1>

      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
          >
            {/* Order Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Order ID: <span className="text-textPrimary dark:text-gray-400">{order.id}</span>
              </h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${order.status === "confirmed"
                    ? "bg-[#3A6351] text-white" // Deep Purple
                    : order.status === "outfordelivery"
                      ? "bg-[#1E88E5] text-white" // Bright Blue
                      : order.status === "preparing"
                        ? "bg-[#D97706] text-white" // Warm Gold
                        : order.status === "delivered"
                          ? "bg-[#2E7D32] text-white" // Rich Green
                          : "bg-gray-400 text-white"
                  }`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Delivery Details */}
            <div className="mb-4 flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <MapPin className="h-5 w-5 text-brandGreen mt-0.5" />
              <div className="text-sm max-w-s break-words">
                <p className="font-medium flex justify-start">{order.deliveryDetails.name}</p>
                <p className="flex justify-start">{order.deliveryDetails.address},{" "}
                  {order.deliveryDetails.city}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Order Items */}
            <div className="space-y-4">
              {order.cartItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {item.name} - {item.netQty} (x{item.quantity})
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-800 dark:text-gray-200">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Order Total & Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Total Amount:
              </h2>
              <div className="flex items-center space-x-1 text-gray-800 dark:text-gray-200">
                <IndianRupee className="h-5 w-5" />
                <span className="text-lg font-semibold">
                  {order.totalAmount ? order.totalAmount.toFixed(2) : "N/A"}
                </span>
              </div>
            </div>

            {order.status === "outfordelivery" && (
              <div className="mt-6 flex justify-end">
                <Button className="bg-[#1E88E5] text-white px-6 py-2 rounded-md hover:bg-opacity-80 active:bg-opacity-70">
                  Track Order
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default OrderPage;
