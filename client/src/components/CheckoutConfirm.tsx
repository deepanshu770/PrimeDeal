import { Dispatch, SetStateAction, useMemo } from "react";
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
import { useCartStore } from "@/zustand/useCartStore";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { useOrderstore } from "@/zustand/useOrderstore";

type CheckoutConfirmProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  shopId?: number;
};

const CheckoutConfirm = ({ open, setOpen, shopId }: CheckoutConfirmProps) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { cartItems, getShopCart, clearShopCart } = useCartStore();
  const { loading } = useOrderstore();

  const defaultAddress =
    user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0];

  const shopCart = shopId ? getShopCart(shopId) : cartItems;

  const totalAmount = useMemo(
    () => shopCart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [shopCart]
  );

  const groupedByShop = useMemo(() => {
    const groups: Record<number, typeof shopCart> = {};
    shopCart.forEach((item) => {
      if (!groups[item.shopId]) groups[item.shopId] = [];
      groups[item.shopId].push(item);
    });
    return groups;
  }, [shopCart]);

  const deliveryDetails = useMemo(
    () => ({
      name: user?.fullname ?? "",
      contact: user?.phoneNumber ?? "",
      address: defaultAddress?.addressLine1 ?? "",
      city: defaultAddress?.city ?? "",
      email: user?.email ?? "",
    }),
    [user, defaultAddress]
  );

  const checkoutHandler = async () => {
    if (!user) {
      toast.error("Please sign in to continue checkout.");
      navigate("/login");
      return;
    }
    if (shopCart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      for (const [sid, items] of Object.entries(groupedByShop)) {
        const shopIdNum = Number(sid);
        const payload = {
          shopId: shopIdNum,
          totalAmount: items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          ),
          cartItems: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
          deliveryDetails,
        };

        // await createCheckoutSession(payload);
        clearShopCart(shopIdNum);
      }
      setOpen(false);
      toast.success("✅ Checkout initiated! Redirecting to payment...");
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Something went wrong while creating checkout session.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Scrollable Content */}
        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
            Review Your Order
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-500 dark:text-gray-400">
            Confirm your delivery details and order summary before payment.
          </DialogDescription>

          {/* 🧍 User Info */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <UserField label="Full Name" value={deliveryDetails.name} />
            <UserField label="Contact" value={`+91 ${deliveryDetails.contact}`} />
            <UserField label="Address" value={deliveryDetails.address} />
            <UserField label="City" value={deliveryDetails.city} />
          </div>

          <div className="flex justify-end -mt-2">
            <button
              onClick={() => navigate("/profile", { state: { from: "/cart" } })}
              className="text-sm font-semibold text-brandGreen hover:text-brandGreen/80 transition"
            >
              Edit Details
            </button>
          </div>

          <Separator />

          {/* 🏬 Shop Breakdown */}
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

                  {/* Scrollable product list for each shop */}
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

          {/* 💰 Grand Total */}
          <div className="flex justify-between items-center border-t pt-4 mt-2 font-bold text-lg">
            <span>Total Amount:</span>
            <span className="text-brandGreen">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Sticky Footer */}
        <DialogFooter className="flex justify-end p-4 border-t bg-white dark:bg-gray-900 sticky bottom-0">
          {loading ? (
            <Button
              disabled
              className="bg-brandGreen text-white hover:bg-brandGreen/80"
            >
              <Loader2 className="animate-spin mr-2 w-4 h-4" /> Please wait...
            </Button>
          ) : (
            <Button
              onClick={checkoutHandler}
              className="bg-brandGreen text-white hover:bg-brandGreen/80"
            >
              Proceed to Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutConfirm;

/* -------------------- Reusable User Info Component -------------------- */
const UserField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <Label className="block text-sm font-semibold text-gray-700 dark:text-white">
      {label}
    </Label>
    <p className="text-gray-700 dark:text-gray-400 truncate">{value}</p>
  </div>
);
