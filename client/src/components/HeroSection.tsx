import { useState } from "react";
import { Input } from "./ui/input"
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import HeroImage from "@/assets/fast-shipping3.png";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
    const [searchText, setSearchText] = useState<string>("");
    const navigate = useNavigate();
    const handleSearch = () => {
        if (searchText.trim() !== "") {
            navigate(`/search/${searchText}`);
        }
    };
    return (
        <div className="flex flex-col md:flex-row max-w-7xl mx-auto md:p-10 rounded-lg items-center justify-center m-4 gap-20">
            <div className="flex flex-col gap-6 md:w-2/3 ">
                <div className="flex flex-col gap-3">
                    <h1 className="font-bold md:font-extrabold md:text-4xl text-3xl">
                        Bringing What You Need, Exactly When You Need
                    </h1>
                    <p className="text-textSecondary dark:text-white">Fast, fresh, and at your doorstep!</p>
                </div>
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
                    <Button className="bg-brandOrange text-white hover:bg-opacity-90 px-6 py-2"
                    onClick={handleSearch}>
                        Search
                    </Button>
                </div>
            </div>
            <div>
                <img src={HeroImage} alt="" className="object-cover w-full max-h-[600px]" />
            </div>
        </div>
    );

};

export default HeroSection