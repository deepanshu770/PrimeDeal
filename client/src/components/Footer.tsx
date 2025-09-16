import { Facebook, Twitter, Instagram } from "lucide-react";
const Footer = () => {
    return (
        <footer className="bg-background py-6 border-t border-gray-300 text-textSecondary text-center">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
                <p className="text-sm dark:text-gray-400">&copy; {new Date().getFullYear()} PrimeDeal. All rights reserved.</p>
                
                <div className="flex space-x-4 mt-3 md:mt-0 dark:text-gray-400">
                    <Facebook className="w-5 h-5 hover:text-brandGreen cursor-pointer" />
                    <Twitter className="w-5 h-5 hover:text-brandGreen cursor-pointer" />
                    <Instagram className="w-5 h-5 hover:text-brandGreen cursor-pointer" />
                </div>
            </div>
        </footer>
    );
}

export default Footer