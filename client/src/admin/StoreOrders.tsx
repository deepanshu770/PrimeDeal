import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCcw, ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";
import { useShopStore } from "@/zustand/useShopStore";
import { useOrderStore } from "@/zustand/useOrderStore";

import { OrderStatus } from "../../../types/types";

const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.confirmed,
  OrderStatus.preparing,
  OrderStatus.out_for_delivery,
  OrderStatus.delivered,
  OrderStatus.cancelled,
];

const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.confirmed,
  OrderStatus.preparing,
  OrderStatus.out_for_delivery,
];

export default function ShopOrders() {
  const { shop, getShop } = useShopStore();
  const { loading, shopOrders, getShopOrders, updateOrderStatus } =
    useOrderStore();

  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  // 🧩 Load shops once
  useEffect(() => {
    if (!shop || shop.length === 0) getShop();
  }, []);

  // 🧾 Fetch orders when a shop is selected
  useEffect(() => {
    if (selectedShopId) getShopOrders(selectedShopId);
  }, [selectedShopId]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast.success(
        `Order #${orderId} updated to ${status.replace(/_/g, " ")}`
      );
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  // 🧮 Only show active/in-process orders
  const activeOrders = useMemo(
    () => shopOrders.filter((o) => ACTIVE_STATUSES.includes(o.orderStatus)),
    [shopOrders]
  );

  /* ---------------------------------------------
     UI STATES
  --------------------------------------------- */

  if (loading && !shopOrders.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-6 w-6 text-brandGreen mb-2" />
        <p className="text-gray-500">Loading your shop orders...</p>
      </div>
    );
  }

  if (!shop || shop.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Store className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Shops Found</h2>
        <p className="text-gray-500 mt-2">
          Please create a shop to view orders.
        </p>
        <Button
          onClick={() => (window.location.href = "/admin/store/new")}
          className="mt-4 bg-brandGreen text-white"
        >
          + Create Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroundLight px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-textPrimary">
          🕒 Active Shop Orders
        </h1>

        {/* Shop Selector */}
        <Select
          value={selectedShopId ? String(selectedShopId) : ""}
          onValueChange={(value) => setSelectedShopId(Number(value))}
        >
          <SelectTrigger className="w-full sm:w-[250px] border border-gray-300 bg-white">
            <SelectValue placeholder="Select a shop" />
          </SelectTrigger>
          <SelectContent>
            {shop.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.storeName} - {s.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => selectedShopId && getShopOrders(selectedShopId)}
          className="bg-brandGreen text-white flex items-center gap-2"
          disabled={!selectedShopId}
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Empty or Unselected */}
      {!selectedShopId ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Select a Shop</h2>
          <p className="text-gray-500 mt-2">
            Choose one of your shops above to see active orders.
          </p>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            No Active Orders
          </h2>
          <p className="text-gray-500 mt-2">
            All orders are completed or cancelled for this shop.
          </p>
        </div>
      ) : (
        /* Orders List */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeOrders.map((order) => (
            <Card
              key={order.id}
              className="shadow-sm hover:shadow-lg border border-gray-200 rounded-xl bg-white transition-all duration-200"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      Order #{order.id}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${
                      order.orderStatus === "out_for_delivery"
                        ? "bg-blue-100 text-blue-700"
                        : order.orderStatus === "preparing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Details */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Customer:</span>{" "}
                    {order.user?.fullname || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Payment:</span>{" "}
                    {order.paymentStatus}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> ₹
                    {order.totalAmount?.toFixed(2)}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Items
                  </h4>
                  <div className="space-y-1">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span>
                          {item.product?.name} × {item.quantity}
                        </span>
                        <span>
                          ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="pt-3 border-t flex flex-col sm:flex-row gap-3 items-center">
                  <Select
                    onValueChange={(value) =>
                      handleStatusChange(order.id, value as OrderStatus)
                    }
                    defaultValue={order.orderStatus}
                    disabled={updating === order.id}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    disabled={
                      order.orderStatus === "cancelled" || updating === order.id
                    }
                    onClick={() =>
                      handleStatusChange(order.id, OrderStatus.cancelled)
                    }
                    className="bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
