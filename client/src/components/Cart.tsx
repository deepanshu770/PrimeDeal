import { CheckCircle, Minus, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import { useEffect, useState } from "react";
import CheckoutConfirm from "./CheckoutConfirm";
import { useLocation } from "react-router-dom";
import { useCartstore } from "@/zustand/useCartstore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CartItem } from "@/types/CartType";

const Cart = () => {
    const [open, setOpen] = useState<boolean>(false);
    const { cartItems, decreMentQuantity,increMentQuantity,clearCart,removeFromCart } = useCartstore();

    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const totalAmount = cartItems.reduce((acc,ele)=>{
        return acc + ele.price * ele.quantity;
    },0)

    // Set success message from navigation state (if available)
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);

            // Clear message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    }, [location.state]);


    return (
        <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
            {/* Cart Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-align-center font-bold text-gray-900 dark:text-gray-100">Your Cart</h2>
            </div>

            {/* Cart Table with responsive design */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                            <TableHead className="w-2/5">Product</TableHead>
                            <TableHead className="w-1/6 text-center">Price</TableHead>
                            <TableHead className="w-1/6 text-center">Quantity</TableHead>
                            <TableHead className="w-1/6 text-right">Total</TableHead>
                            <TableHead className="w-1/12 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            cartItems.map((item: CartItem) => (
                                <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    {/* Product */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md">
                                                <AvatarImage src={item.image} alt={item.name} />
                                                <AvatarFallback className="text-xs text-gray-500">IMG</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{item.name}{" "}({item.netQty})</span>
                                        </div>
                                    </TableCell>
                                    {/* Price */}
                                    <TableCell className="text-center">₹{item.price}</TableCell>
                                    {/* Quantity */}
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            <div className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1">
                                                <Button className="p-1 bg-textSecondary hover:bg-textSecondary/80 dark:bg-gray-200 rounded-full" size="icon"
                                                onClick={() => decreMentQuantity(item.id)}>
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                                <Button className="p-1 bg-brandOrange hover:bg-brandOrange/80 text-white rounded-full" size="icon" onClick={() => increMentQuantity(item.id)}>
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* Total */}
                                    <TableCell className="text-right font-medium">₹{item.price * item.quantity}</TableCell>
                                    {/* Remove Button */}
                                    <TableCell className="text-center">
                                        <Button
                                            onClick={() => removeFromCart(item.id)}    
                                            className="p-2 text-error hover:text-error/70 hover:bg-error/10 dark:hover:bg-error/20 bg-transparent rounded-full transition-colors"
                                            size="icon"
                                            title="Remove item"
                                        >
                                            <X className="w-2 h-2" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        }

                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                            <TableCell colSpan={3} className="font-semibold text-left">Total</TableCell>
                            <TableCell className="text-right font-bold text-lg">₹{totalAmount}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            {/* Buttons Container - Right aligned */}
            <div className="flex justify-end items-center gap-4 mt-6">
                <Button onClick={() => setOpen(true)} className="bg-brandGreen text-white hover:bg-brandGreen/70 px-6 py-2 rounded-md h-10" disabled={totalAmount === 0}>
                    Proceed to Checkout
                </Button>
                <Button onClick={clearCart} className="bg-error text-white hover:bg-error/70 px-6 py-2 rounded-md h-10" >
                    Clear All
                </Button>
            </div>

            {/* Success Alert */}
            {successMessage && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2 border-l-4 border-green-500" >
                    <CheckCircle className="w-5 h-5" />
                    <span>{successMessage}</span>
                </div>
            )}

            <CheckoutConfirm open={open} setOpen={setOpen} />
        </div>
    );
};

export default Cart;
