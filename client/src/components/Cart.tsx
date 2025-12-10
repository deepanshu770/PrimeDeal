import { CheckCircle, Minus, Plus, X, ShoppingBag, Store } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useEffect, useMemo, useState } from "react";
import CheckoutConfirm from "./CheckoutConfirm";
import { useLocation } from "react-router-dom";
import { useCartStore } from "@/zustand/useCartStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Cart = () => {
  const [open, setOpen] = useState<boolean>(false);
  const {
    cartItems,
    decreMentQuantity,
    increMentQuantity,
    clearCart,
    removeFromCart,
  } = useCartStore();

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /** ✅ Group cart items by shop */
  const groupedCart = useMemo(() => {
    const groups: Record<number, typeof cartItems> = {};
    cartItems.forEach((item) => {
      if (!groups[item.shopId]) groups[item.shopId] = [];
      groups[item.shopId].push(item);
    });
    return groups;
  }, [cartItems]);

  /** 🧮 Compute total amount */
  const grandTotal = useMemo(
    () =>
      cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  /** ✅ Show success message from navigation (after checkout) */
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [location.state]);

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Your Cart
        </h2>
      </div>

      {/* 🛒 Empty Cart */}
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {Object.entries(groupedCart).map(([shopId, items]) => {
            const shopName = items[0]?.shopName || "Shop";
            const shopTotal = items.reduce(
              (acc, i) => acc + i.price * i.quantity,
              0
            );

            return (
              <div
                key={shopId}
                className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                {/* 🏬 Shop Header */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-3">
                  <Store className="text-brandGreen w-5 h-5" />
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                    {shopName}
                  </h3>
                </div>

                {/* 🧾 Product Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-2/5">Product</TableHead>
                      <TableHead className="w-1/6 text-center">Price</TableHead>
                      <TableHead className="w-1/6 text-center">
                        Quantity
                      </TableHead>
                      <TableHead className="w-1/6 text-right">Total</TableHead>
                      <TableHead className="w-1/12 text-center">Remove</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={`${item.shopId}-${item.id}`}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Product Info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md">
                              <AvatarImage
                                src={item.image}
                                alt={item.productName}
                              />
                              <AvatarFallback className="text-xs text-gray-500">
                                IMG
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.productName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.netQty} {item.unit}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Price */}
                        <TableCell className="text-center text-gray-800 dark:text-gray-200">
                          ₹{item.price.toFixed(2)}
                        </TableCell>

                        {/* Quantity Controls */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1">
                              <Button
                                variant="default"
                                className="p-1 bg-brandOrange rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                size="icon"
                                onClick={() =>
                                  decreMentQuantity(item.id, item.shopId)
                                }
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center font-bold text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="default"
                                className="p-1 bg-brandOrange rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                size="icon"
                                onClick={() =>
                                  increMentQuantity(item.id, item.shopId)
                                }
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right font-medium text-gray-800 dark:text-gray-200">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </TableCell>

                        {/* Remove Button */}
                        <TableCell className="text-center">
                          <Button
                            variant="default"
                            onClick={() => removeFromCart(item.id, item.shopId)}
                            className="p-2 bg-white text-error hover:text-error/80 hover:bg-error/10 dark:hover:bg-error/20 rounded-full transition-colors"
                            size="icon"
                            title="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                  {/* Shop Total */}
                  <TableFooter>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                      <TableCell colSpan={3} className="font-semibold text-left">
                        Shop Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-brandGreen">
                        ₹{shopTotal.toFixed(2)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            );
          })}

          {/* 🧾 Grand Total + Actions */}
          <div className="flex justify-end items-center gap-4 mt-6">
            <Button
              onClick={() => setOpen(true)}
              className="bg-brandGreen text-white hover:bg-brandGreen/80 px-6 py-2 rounded-md h-10"
              disabled={grandTotal === 0}
            >
              Proceed to Checkout
            </Button>
            <Button
              onClick={clearCart}
              className="bg-error text-white hover:bg-error/80 px-6 py-2 rounded-md h-10"
            >
              Clear All
            </Button>
          </div>
        </>
      )}

      {/* 🧾 Checkout Modal */}
      <CheckoutConfirm open={open} setOpen={setOpen} />

      {/* ✅ Success Message */}
      {successMessage && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2 border-l-4 border-green-500">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Cart;

/* -------------------- Empty Cart -------------------- */
const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div className="bg-brandOrange/10 p-6 rounded-full">
      <ShoppingBag className="w-14 h-14 text-brandOrange" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
      Your cart is empty
    </h3>
    <p className="text-gray-500 dark:text-gray-400">
      Add some products from your favorite shops!
    </p>
  </div>
);
