import { Link } from "react-router-dom";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./ui/menubar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  History,
  Home,
  ListChecks,
  ListTodo,
  Loader2,
  LucideShoppingCart,
  Menu,
  Moon,
  ShoppingBag,
  ShoppingCartIcon,
  Store,
  Sun,
  User,
} from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useUserStore } from "@/zustand/useUserStore";
import { useCartstore } from "@/zustand/useCartstore";
import { useThemeStore } from "@/zustand/useThemeStore";

const Navbar = () => {
  const { user, loading, logout } = useUserStore();
  const { cartItems } = useCartstore();
  const { setTheme } = useThemeStore();

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div
        className={`flex items-center justify-between h-16 w-full ${
          user?.admin ? "gap-[40rem]" : "gap-[35rem]"
        }`}
      >
        {/* Left-aligned Brand Logo */}
        <Link className="flex items-center gap-2 cursor-pointer" to="/">
          <ShoppingBag className="text-brandOrange w-6 h-6" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Prime<span className="text-brandOrange font-bold">Deal</span>
          </h1>
        </Link>

        {/* Right-aligned Navbar Links */}
        <div className="hidden md:flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            {/* ✅ Show Home & Orders only for normal users */}
            {!user?.admin && (
              <>
                <Link
                  to="/"
                  className="text-textPrimary hover:text-brandGreen transition dark:text-white"
                >
                  Home
                </Link>
                <Link
                  to="/nearby"
                  className="text-textPrimary hover:text-brandGreen transition dark:text-white"
                >
                  Nearby
                </Link>
                <Link
                  to="/order/status"
                  className="text-textPrimary hover:text-brandGreen transition dark:text-white"
                >
                  Orders
                </Link>
              </>
            )}

            {/* ✅ Profile Link (Accessible by Both) */}
            <Link
              to="/profile"
              className="text-textPrimary hover:text-brandGreen transition dark:text-white"
            >
              Profile
            </Link>

            {/* ✅ Admin Dashboard (Only for Admins) */}
            {user?.admin && (
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="bg-transparent text-textPrimary dark:text-white hover:bg-brandGreen hover:text-white data-[state=open]:bg-brandGreen data-[state=open]:text-white transition">
                    Dashboard
                  </MenubarTrigger>

                  <MenubarContent className="bg-white dark:bg-gray-800 shadow-lg rounded-md">
                    <Link to="/admin/store">
                      <MenubarItem className="px-3 py-2 text-textPrimary dark:text-white hover:bg-brandOrange dark:hover:bg-brandGreen hover:text-white transition">
                        Store
                      </MenubarItem>
                    </Link>
                    <Link to="/admin/products">
                      <MenubarItem className="px-3 py-2 text-textPrimary dark:text-white hover:bg-brandOrange dark:hover:bg-brandGreen hover:text-white transition">
                        Products
                      </MenubarItem>
                    </Link>
                    <Link to="/admin/storeOrders">
                      <MenubarItem className="px-3 py-2 text-textPrimary dark:text-white hover:bg-brandOrange dark:hover:bg-brandGreen hover:text-white transition">
                        Orders
                      </MenubarItem>
                    </Link>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
          </div>

          <div className="flex items-center gap-6 h-10">
            {/* Theme Toggle */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dark:bg-red dark:text-white"
                >
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ✅ Hide Cart for Admins */}
            {!user?.admin && (
              <Link
                to="/cart"
                className="relative cursor-pointer text-textPrimary dark:text-white hover:text-brandGreen"
              >
                <LucideShoppingCart className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <Button
                    size="icon"
                    className="absolute -inset-y-3 left-2 text-xs font-bold rounded-full h-4 w-2 bg-brandGreen text-white"
                  >
                    {cartItems.length}
                  </Button>
                )}
              </Link>
            )}

            {/* Avatar */}
            <Link to="/profile">
              <Avatar className="h-9 w-9 border border-gray-300">
                <AvatarImage src={user?.profilePicture || ""} />
                <AvatarFallback className="flex items-center justify-center h-full w-full text-sm font-medium">
                  CN
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Logout Button */}
            <div>
              {loading ? (
                <Button
                  disabled
                  className="w-28 h-10 bg-error text-white rounded-md hover:bg-opacity-90 transition border-transparent gap-2"
                >
                  <Loader2 className="animate-spin h-4 w-4" /> Please wait...
                </Button>
              ) : (
                <Button
                  onClick={logout}
                  className="w-24 h-10 bg-error text-white hover:bg-opacity-90 transition"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="absolute right-4 md:hidden lg:hidden">
          <MobileNavbar />
        </div>
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = () => {
  const { user, loading, logout } = useUserStore();
  const { setTheme } = useThemeStore();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size={"icon"}
          className="rounded-full bg-gray-200 text-textPrimary hover:bg-gray-300 transition"
        >
          <Menu size={"18"} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col pl-2">
        {/* Override the default close button */}
        <SheetHeader className="flex  flex-row items-center justify-betweeen mt-2">
          <div className="absolute top-5">
            <SheetTitle>Prime Deal</SheetTitle>
          </div>

          <div className="absolute right-6 top-12 font-extrabold">
            {/* Theme Toggle Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>

              {/* Dropdown Menu Positioned at the Top Right */}
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>
        <Separator className="my-2 mt-12" />
        <SheetDescription className="flex-1">
          <Link
            to="/"
            className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition 
             text-textPrimary hover:bg-[#EAEAEA] active:bg-[#EAEAEA] hover:text-brandGreen 
             active:text-brandGreen"
          >
            <Home />
            <span>Home</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition 
             text-textPrimary hover:bg-[#EAEAEA] active:bg-[#EAEAEA] hover:text-brandGreen 
             active:text-brandGreen"
          >
            <User />
            <span>Profile</span>
          </Link>
          <Link
            to="/order/status"
            className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition 
             text-textPrimary hover:bg-[#EAEAEA] active:bg-[#EAEAEA] hover:text-brandGreen 
             active:text-brandGreen"
          >
            <History />
            <span>Orders</span>
          </Link>
          <Link
            to="/Cart"
            className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition 
             text-textPrimary hover:bg-[#EAEAEA] active:bg-[#EAEAEA] hover:text-brandGreen 
             active:text-brandGreen"
          >
            <ShoppingCartIcon />
            <span>Cart</span>
          </Link>
          {user?.admin && (
            <>
              <Link
                to="/admin/products"
                className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition 
             text-textPrimary hover:bg-[#EAEAEA] active:bg-[#EAEAEA] hover:text-brandGreen 
             active:text-brandGreen"
              >
                <ListTodo />
                <span>Products</span>
              </Link>
              <Link
                to="/admin/store"
                className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition 
             text-textPrimary hover:bg-[#EAEAEA] active:bg-[#EAEAEA] hover:text-brandGreen 
             active:text-brandGreen"
              >
                <Store />
                <span>My Store</span>
              </Link>
              <Link
                to="/admin/storeOrders"
                className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition 
             text-textPrimary hover:bg-[#EAEAEA] active:bg-[#EAEAEA] hover:text-brandGreen 
             active:text-brandGreen"
              >
                <ListChecks />
                <span>Store Orders </span>
              </Link>
            </>
          )}
        </SheetDescription>

        <SheetFooter>
          <SheetClose asChild>
            {loading ? (
              <Button
                disabled
                className="bg-error text-white hover:bg-opacity-90 transition"
              >
                <Loader2 className="animate-spin h-4 w-4" /> Please wait...
              </Button>
            ) : (
              <Button
                onClick={logout}
                className="bg-error text-white hover:bg-opacity-90 transition"
              >
                Logout
              </Button>
            )}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
