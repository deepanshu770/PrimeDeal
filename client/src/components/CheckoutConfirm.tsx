import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/zustand/useUserStore";
import {  useCartStore } from "@/zustand/useCartStore";
import { Store, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAddressStore } from "@/zustand/useAddressStore";
import { cn } from "@/lib/utils";

type CheckoutConfirmProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const CheckoutConfirm = ({ open, setOpen }: CheckoutConfirmProps) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { cartItems } = useCartStore();
  const {
    addresses,
    getAddresses,
    loading: addressLoading,
    selectedAddress,
    setSelectedAddress,
  } = useAddressStore();


  // Load user addresses
  useEffect(() => {
    getAddresses();
  }, [getAddresses]);

  // Calculate totals
  const totalAmount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  // Group products by shop
  const groupedByShop = useMemo(() => {
    const groups: Record<number, typeof cartItems> = {};
    cartItems.forEach((item) => {
      if (!groups[item.shopId]) groups[item.shopId] = [];
      groups[item.shopId].push(item);
    });
    return groups;
  }, [cartItems]);

  const checkoutHandler = async () => {
    if (!user) {
      toast.error("Please sign in to continue checkout.");
      navigate("/login");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      const cartItems: {
        shopId: number;
        productId: number;
        quantity: number;
      }[] = [];
      for (const [sid, items] of Object.entries(groupedByShop)) {
        items.forEach((item) => {
          cartItems.push({
            shopId: Number(sid),
            productId: item.id,
            quantity: item.quantity,
          });
        });
      }
      const payload = {
        totalAmount,
        addressId: selectedAddress.id,
        cartItems,
      };
      console.log(payload);
      navigate("/payment", { state: { payload, totalAmount } });

      setOpen(false);
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Something went wrong while creating your order.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
            Review Your Order
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-500 dark:text-gray-400">
            Confirm your delivery address and order details before placing your
            order.
          </DialogDescription>

          {/* 🧍 User Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <UserField label="Full Name" value={user?.fullname ?? ""} />
            <UserField
              label="Contact"
              value={`+91 ${user?.phoneNumber ?? ""}`}
            />
          </div>

          {/* 🏠 Address Selector */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              Select Delivery Address
            </h3>

            {addressLoading ? (
              <p className="text-gray-500 text-sm">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-500">
                No saved addresses.{" "}
                <button
                  onClick={() => navigate("/setup-address")}
                  className="text-brandGreen font-semibold underline hover:text-brandGreen/80"
                >
                  Add one now.
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={cn(
                      "flex bg-white items-start gap-3 p-3 border rounded-lg transition-all text-left",
                      "hover:border-brandGreen/60 dark:hover:border-brandGreen/70",
                      selectedAddress?.id === addr.id
                        ? "border-brandGreen bg-brandGreen/5"
                        : "border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <MapPin className="w-5 h-5 text-brandGreen mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {addr.city}, {addr.state}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                  </button>
                ))}

            
              </div>
            )}
          </div>

        
          <Separator />

          {/* 🏬 Shop Summary */}
          <div className="space-y-5">
            {Object.entries(groupedByShop).map(([sid, items]) => {
              const subtotal = items.reduce(
                (acc, i) => acc + i.price * i.quantity,
                0
              );
              return (
                <div
                  key={sid}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-4 h-4 text-brandGreen" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {items[0]?.shopName ?? "Shop"}
                    </h3>
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                    {items.map((item) => (
                      <div
                        key={`${item.shopId}-${item.id}`}
                        className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span>
                          {item.productName} × {item.quantity} ({item.netQty}{" "}
                          {item.unit})
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-medium mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Shop Total:</span>
                    <span className="text-brandGreen font-semibold">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-2 font-bold text-lg">
            <span>Total Amount:</span>
            <span className="text-brandGreen">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Sticky Footer */}
        <DialogFooter className="flex justify-end p-4 border-t bg-white dark:bg-gray-900 sticky bottom-0">
          <Button
            onClick={checkoutHandler}
            className="bg-brandGreen text-white hover:bg-brandGreen/80"
          >
            Place Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutConfirm;

/* -------------------- User Info Field -------------------- */
const UserField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between mb-1">
    <Label className="text-sm font-semibold text-gray-700 dark:text-white">
      {label}
    </Label>
    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{value}</p>
  </div>
);
