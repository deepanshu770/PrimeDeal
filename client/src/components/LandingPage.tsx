import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Store, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "../assets/fast-shipping.png"
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-orange-50 dark:from-gray-950 dark:to-gray-900">
      {/* ---------------- Navbar ---------------- */}
      <header className="w-full flex justify-between items-center py-4 px-6 md:px-12 border-b border-gray-200 dark:border-gray-800">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
        >
          <ShoppingBag className="text-brandOrange w-6 h-6" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Prime<span className="text-brandOrange font-bold">Deal</span>
          </h1>
        </motion.div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="text-white bg-slate-700 hover:bg-slate-500"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            className="bg-brandOrange text-white hover:bg-opacity-90"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* ---------------- Hero Section ---------------- */}
      <main className="flex flex-col md:flex-row items-center justify-between flex-1 px-6 md:px-12 py-16 md:py-24">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Discover <span className="text-brandOrange">execllent local deals</span> like
            never before.
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
            PrimeDeal connects you with nearby shops, offers real-time
            discounts, and gives AI-powered recommendations — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Button
              className="bg-brandOrange text-white px-6 py-3 hover:bg-opacity-90 flex items-center gap-2 text-lg"
              onClick={() => navigate("/signup?role=customer")}
            >
              <Sparkles className="w-5 h-5" />
              Join as Customer
            </Button>
            <Button
              variant="outline"
              className="border-brandOrange text-brandOrange hover:bg-orange-50 dark:hover:bg-gray-800 flex items-center gap-2 text-lg"
              onClick={() => navigate("/signup?role=admin")}
            >
              <Store className="w-5 h-5" />
              Join as Seller / Admin
            </Button>
          </div>
        </motion.div>

        {/* Image / Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 mt-12 md:mt-0 flex justify-center"
        >
          <img
           src={Image}
            alt="PrimeDeal Shopping"
            className="w-full max-w-lg "
          />
        </motion.div>
      </main>

      {/* ---------------- Features Section ---------------- */}
      <section className="py-16 px-6 md:px-12 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-center text-2xl font-semibold text-gray-900 dark:text-white mb-10">
          Why Choose <span className="text-brandOrange">PrimeDeal?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Sparkles className="w-8 h-8 text-brandOrange" />,
              title: "AI-Powered Deals",
              desc: "Get smart, personalized recommendations tailored to your interests and local shops.",
            },
            {
              icon: <Store className="w-8 h-8 text-brandOrange" />,
              title: "Support Local Stores",
              desc: "Discover and shop from trusted local vendors while helping your community grow.",
            },
            {
              icon: <ArrowRight className="w-8 h-8 text-brandOrange" />,
              title: "Real-Time Offers",
              desc: "Never miss out on flash sales or exclusive nearby offers updated in real-time.",
            },
          ].map((f, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-gray-900"
            >
              <div className="mb-3">{f.icon}</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {f.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800">
        © {new Date().getFullYear()} PrimeDeal. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
