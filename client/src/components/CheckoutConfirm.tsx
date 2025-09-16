import { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/zustand/useUserStore";
import { CheckoutSessionRequest } from "@/types/orderType";
import { useCartstore } from "@/zustand/useCartstore";
import { useShopStore } from "@/zustand/useShopStore";
import { useOrderstore } from "@/zustand/useOrderstore";
import { Loader2 } from "lucide-react";

const CheckoutConfirm = ({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { user } = useUserStore();
    const { singleShop } = useShopStore();
    const {  loading } = useOrderstore();
    {/* User Data State */ }
    const [UserData] = useState({
        fullname: user?.fullname || "",
        contact: user?.contact.toString() || "",
        address: user?.address || "",
        city: user?.city || "",
        email: user?.email || "",
    });

    const { cartItems } = useCartstore();
    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const checkoutHandler = async () => {
        try {
            const checkoutData: CheckoutSessionRequest = {
                cartItems: cartItems.map((cartItem) => ({
                    productId: cartItem.id,
                    name: cartItem.name,
                    image: cartItem.image,
                    price: cartItem.price.toString(),
                    quantity: cartItem.quantity.toString(),
                    netQty: cartItem.netQty
                })),
                deliveryDetails: {
                    name: UserData.fullname,
                    address: UserData.address,
                    city: UserData.city,
                    contact: UserData.contact,
                    email: UserData.email
                },
                shopId: singleShop?.id as string,
                totalAmount,
            };
            alert("Checkout Not Implemented Yet")
            // await createCheckoutSession(checkoutData);
        } catch (error) {
            console.log(error);
        }
    };


    {/* Navigate Handler */ }
    const navigate = useNavigate();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-4 space-y-2">
                <DialogTitle className="text-extrabold mt-1">Review Your Order</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Please verify your details and order summary before proceeding.
                </DialogDescription>


                {/* User Info */}
                <div className="grid grid-cols-2 gap-4 ">
                    <div>
                        <Label className="block text-sm text-gray-700 dark:text-white font-semibold">Full Name</Label>
                        <p className="text-gray-700 dark:text-gray-400">{UserData.fullname}</p>
                    </div>
                    <div>
                        <Label className="block text-sm text-gray-700 dark:text-white font-semibold">Contact</Label>
                        <p className="text-gray-700 dark:text-gray-400">+91 {UserData.contact}</p>
                    </div>
                    <div>
                        <Label className="block text-sm text-gray-700 dark:text-white font-semibold">Address</Label>
                        <p className="text-gray-700 dark:text-gray-400">{UserData.address}</p>
                    </div>
                    <div>
                        <Label className="block text-sm text-gray-700 dark:text-white font-semibold">City</Label>
                        <p className="text-gray-700 dark:text-gray-400">{UserData.city}</p>
                    </div>
                </div>

                {/* Edit Button */}
                <div className="flex justify-end h-4 mr-4">
                    <span className="text-brandGreen bg-white dark:bg-transparent hover:bg-white dark:hover:bg-transparent  hover:text-brandGreen/80 font-semibold" onClick={() => navigate(`/profile`, { state: { from: "/cart" } })}>Edit</span>
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2">
                    <h2 className="font-bold text-center">Order Summary</h2>

                    {/* Order Items */}
                    <div className="space-y-1">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name}  x {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between font-semibold text-lg mt-2">
                        <span>Total:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                {/* Buttons */}
                <DialogFooter className="flex justify-end mt-4">
                    {loading ? (
                        <Button disabled className="bg-brandGreen text-white hover:bg-brandGreen/80">
                            <Loader2 className="animate-spin mr-2 w-4 h-4" /> Please wait...
                        </Button>
                    ) : (
                        <Button onClick={checkoutHandler} className="bg-brandGreen text-white hover:bg-brandGreen/80">
                            Proceed to Payment
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

};

export default CheckoutConfirm;
