import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Search, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import HeroImage from "@/assets/fast-shipping3.png";
import { useNavigate } from "react-router-dom";
import { useAddressStore } from "@/zustand/useAddressStore";

const HeroSection = () => {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { addresses, getAddresses } = useAddressStore();

  useEffect(() => {
    if (addresses.length === 0) {
      getAddresses();
    }
  }, []);

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      navigate(`/search?q=${searchText}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 flex flex-col gap-4">

      {/* 🔴 Warning banner (full width, above hero) */}
      {addresses.length === 0 && (
        <div className="w-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300
                        border border-red-300 dark:border-red-700 px-4 py-3 rounded-lg
                        flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600 dark:text-red-300" />
            <p className="text-sm font-medium">
              No address found. Please add one to continue ordering.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => navigate("/setup-address")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Add Address
          </Button>
        </div>
      )}

      {/* ⭐ MAIN HERO SECTION */}
      <div className="flex flex-col md:flex-row gap-20 items-center justify-center">

        {/* Left Content */}
        <div className="flex flex-col gap-6 md:w-2/3">
          <div className="flex flex-col gap-3">
            <h1 className="font-bold md:font-extrabold md:text-4xl text-3xl">
              Bringing What You Need, Exactly When You Need
            </h1>
            <p className="text-textSecondary dark:text-white">
              Fast, fresh, and at your doorstep!
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Input
                type="text"
                value={searchText}
                placeholder="Search for products or shops"
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 shadow-lg w-full placeholder:text-textSecondary"
              />
              <Search className="text-textPrimary absolute inset-y-2 left-2" />
            </div>

            <Button
              className="bg-brandOrange text-white hover:bg-opacity-90 px-6 py-2"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div>
          <img
            src={HeroImage}
            alt=""
            className="object-cover w-full max-h-[600px]"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
