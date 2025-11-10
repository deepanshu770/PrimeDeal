import { useEffect } from "react";
import { Loader2, Store, CalendarDays, IndianRupee, PackageX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "@/zustand/useOrderStore";

const OrderPage = () => {
  const { orders, getUserOrders, loading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    getUserOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 text-brandGreen animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <PackageX className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        <h1 className="font-bold text-2xl text-gray-700 mt-4 dark:text-white">
          No Orders Yet!
        </h1>
        <p className="text-gray-500 text-sm mt-2 dark:text-gray-400">
          You haven’t placed any orders yet. Start shopping now! 🛒
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-4">
      <h1 className="text-3xl font-extrabold text-textPrimary text-center mb-8 dark:text-white">
        My Orders
      </h1>

      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <span>Order ID</span>
          <span>Shop</span>
          <span>Date</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {/* Orders */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className="grid md:grid-cols-5 grid-cols-2 md:gap-4 gap-y-2 items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                #{order.id}
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Store className="w-4 h-4 text-brandGreen" />
                <span className="truncate">{order.shop?.storeName ?? "Shop"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-800 dark:text-gray-200 font-semibold">
                <IndianRupee className="w-4 h-4" />
                {order.totalAmount.toFixed(2)}
              </div>
              <div className="flex justify-start md:justify-center">
                <OrderStatusBadge status={order.orderStatus} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;

/* 🟢 Reusable Order Status Badge */
const OrderStatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-500/90",
    confirmed: "bg-blue-500/90",
    preparing: "bg-orange-500/90",
    out_for_delivery: "bg-teal-600/90",
    delivered: "bg-green-600/90",
    cancelled: "bg-red-500/90",
    failed: "bg-gray-500/90",
  };

  const label = status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return (
    <span
      className={`px-3 py-1 text-xs font-medium text-white rounded-full capitalize ${
        colorMap[status] || "bg-gray-400"
      }`}
    >
      {label}
    </span>
  );
};
