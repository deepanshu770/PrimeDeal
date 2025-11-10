import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useShopStore } from "@/zustand/useShopStore";
import { useProductStore } from "@/zustand/useProductStore";
import axios from "axios";

export default function ProductCatalog() {
  const { shop: shopList } = useShopStore();
  const { products, loading, fetchAllProducts, createProduct } = useProductStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [openAddToShop, setOpenAddToShop] = useState(false);

  // ✅ Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/v1/product/category");
        if (res.data.success) setCategories(res.data.categories);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch all products (filter by search + category)
  useEffect(() => {
    fetchAllProducts(search, selectedCategory ?? undefined);
  }, [search, selectedCategory]);

  // 🛒 Add product to shop
  const handleAdd = async () => {
    if (!selectedShop || !price || !quantity) {
      toast.error("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("productId", selectedProduct.id);
    formData.append("price", price);
    formData.append("quantity", quantity);

    try {
      await createProduct(formData, selectedShop);
      toast.success(`Added to ${shopList.find(s => s.id === selectedShop)?.storeName}`);
      setOpenAddToShop(false);
      setPrice("");
      setQuantity("");
      setSelectedShop(null);
    } catch {
      toast.error("Failed to add product");
    }
  };
  if (shopList.length === 0) {
    // 🧩 Show empty-state UI
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h2 className="text-2xl font-bold text-gray-700">No Shops Found</h2>
        <p className="text-gray-500 mt-2">
          Please create a shop before managing products.
        </p>
        <Button
          onClick={() => (window.location.href = "/admin/store/new")}
          className="mt-4 bg-brandOrange text-white hover:bg-hoverOrange"
        >
          + Create Shop
        </Button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-backgroundLight px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">🛍️ Product Catalog</h1>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button
          onClick={() => fetchAllProducts(search, selectedCategory ?? undefined)}
          disabled={loading}
          className="bg-brandGreen text-white"
        >
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4 mr-1" />
          ) : (
            <Search className="w-4 h-4 mr-1" />
          )}
          Search
        </Button>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
            selectedCategory === null
              ? "bg-brandGreen text-white border-brandGreen"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
            }
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              selectedCategory === cat.id
                ? "bg-brandGreen text-white border-brandGreen"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          products.map((p) => (
            <Card
              key={p.id}
              className="rounded-xl shadow-sm hover:shadow-lg transition"
            >
              <CardContent className="p-4 space-y-3">
                <img
                  src={p.image || "https://placehold.co/300x300?text=Product"}
                  alt={p.name}
                  className="w-full h-52 rounded-lg object-cover hover:scale-105 transition"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.brand}</p>
                  <p className="text-xs text-gray-400">{p.netQty}</p>
                  <p className="text-xs text-gray-500">{p.category?.name}</p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedProduct(p);
                    setOpenAddToShop(true);
                  }}
                  className="w-full bg-brandOrange text-white"
                >
                  + Add to Shop
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add to Shop Modal */}
      <Dialog open={openAddToShop} onOpenChange={setOpenAddToShop}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Add “{selectedProduct?.name}” to Shop
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <select
              value={selectedShop ?? ""}
              onChange={(e) => setSelectedShop(Number(e.target.value))}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select a shop...</option>
              {shopList.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.storeName} - {shop.city}
                </option>
              ))}
            </select>

            <Input
              placeholder="Price (₹)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              placeholder="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <Button
              onClick={handleAdd}
              disabled={loading}
              className="w-full bg-brandGreen text-white"
            >
              {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
