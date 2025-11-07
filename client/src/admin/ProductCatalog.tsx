import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search } from "lucide-react";
import { useShopStore } from "@/zustand/useShopStore";

export default function ProductCatalog() {
  // ✅ Dummy product catalog
  const initialCatalog = [
    {
      id: 1,
      name: "Amul Butter",
      brand: "Amul",
      netQty: "500g",
      category: "Dairy & Bakery",
      description: "Delicious and creamy butter for everyday use.",
      image: "https://placehold.co/300x300?text=Amul+Butter",
    },
    {
      id: 2,
      name: "Dove Shampoo",
      brand: "Dove",
      netQty: "180ml",
      category: "Personal Care",
      description: "Nourishing shampoo for soft and shiny hair.",
      image: "https://placehold.co/300x300?text=Dove+Shampoo",
    },
    {
      id: 3,
      name: "Lays Chips - Classic Salted",
      brand: "Lays",
      netQty: "50g",
      category: "Snacks & Packaged Foods",
      description: "Crispy potato chips with a perfect salty flavor.",
      image: "https://placehold.co/300x300?text=Lays+Chips",
    },
  ];

  // ✅ Categories
  const categories = [
    "Groceries",
    "Dairy & Bakery",
    "Snacks & Packaged Foods",
    "Beverages",
    "Personal Care",
    "Household Essentials",
  ];

  // Zustand store for shops
  const shopList = useShopStore((state) => state.shop);

  // 🧠 States
  const [catalog, setCatalog] = useState(initialCatalog);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(initialCatalog);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAddToShop, setOpenAddToShop] = useState(false);
  const [openNewProduct, setOpenNewProduct] = useState(false);

  // New Product Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    netQty: "",
    category: "",
    description: "",
    image: "",
  });

  // 🔍 Search Logic
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  };

  // ➕ Simulate Add Product to Shop
  const handleAdd = () => {
    if (!selectedShop) {
      alert("⚠️ Please select a shop first.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        `✅ "${selectedProduct.name}" added to "${
          shopList.find((s) => s.id === selectedShop)?.storeName
        }"!\nPrice: ₹${price}\nQuantity: ${quantity}`
      );
      setOpenAddToShop(false);
      setPrice("");
      setQuantity("");
      setSelectedShop(null);
    }, 1000);
  };

  // 🆕 Add New Product
  const handleCreateProduct = () => {
    const { name, category, netQty } = newProduct;
    if (!name || !category || !netQty) {
      alert("⚠️ Please fill required fields (Name, Category, Net Qty).");
      return;
    }

    const newItem = {
      ...newProduct,
      id: catalog.length + 1,
      image:
        newProduct.image || "https://placehold.co/300x300?text=New+Product",
    };

    setCatalog([...catalog, newItem]);
    setFiltered([...catalog, newItem]);
    setNewProduct({
      name: "",
      brand: "",
      netQty: "",
      category: "",
      description: "",
      image: "",
    });
    setOpenNewProduct(false);
    alert("✅ New product added to catalog!");
  };

  return (
    <div className="min-h-screen bg-backgroundLight px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">
          🛍️ Product Catalog
        </h1>
        <Button
          onClick={() => setOpenNewProduct(true)}
          className="flex items-center gap-2 bg-brandOrange hover:bg-hoverOrange text-white"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Button>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row items-center gap-3 mb-8"
      >
        <Input
          placeholder="Search product name or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md border border-border focus:ring-2 focus:ring-brandGreen"
        />
        <Button
          type="submit"
          className="flex items-center gap-2 bg-brandGreen hover:bg-emerald-700 text-white px-5 py-2 rounded-md"
        >
          <Search className="w-4 h-4" /> Search
        </Button>
      </form>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <p className="text-textSecondary">No products found.</p>
        ) : (
          filtered.map((p) => (
            <Card
              key={p.id}
              className="rounded-2xl shadow-sm border border-border hover:shadow-lg transition bg-white"
            >
              <CardContent className="p-4 space-y-3">
                <div className="aspect-square overflow-hidden rounded-xl">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-textPrimary">{p.name}</h3>
                  <p className="text-sm text-textSecondary">{p.brand}</p>
                  <p className="text-xs text-gray-400">{p.netQty}</p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedProduct(p);
                    setOpenAddToShop(true);
                  }}
                  className="w-full bg-brandOrange hover:bg-hoverOrange text-white font-medium rounded-md py-2"
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
            <DialogTitle className="text-lg font-semibold text-textPrimary">
              Add “{selectedProduct?.name}” to Shop
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-textSecondary">
                Select Shop
              </label>
              <Select
                onValueChange={(value) => setSelectedShop(Number(value))}
                value={selectedShop ? String(selectedShop) : ""}
              >
                <SelectTrigger className="w-full border border-border bg-white text-textPrimary mt-1">
                  <SelectValue placeholder="Select a shop..." />
                </SelectTrigger>
                <SelectContent>
                  {shopList.map((shop) => (
                    <SelectItem key={shop.id} value={String(shop.id)}>
                      {shop.storeName} - {shop.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-textSecondary">
                Price (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-textSecondary">
                Quantity
              </label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <Button
              disabled={loading}
              onClick={handleAdd}
              className="w-full bg-brandGreen hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> Adding...
                </div>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Product Modal */}
      <Dialog open={openNewProduct} onOpenChange={setOpenNewProduct}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-textPrimary">
              Add New Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <Input
                placeholder="Brand"
                value={newProduct.brand}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, brand: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Net Qty (e.g. 500g)"
                value={newProduct.netQty}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, netQty: e.target.value })
                }
              />
              <Select
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, category: value })
                }
                value={newProduct.category}
              >
                <SelectTrigger className="w-full border border-border bg-white text-textPrimary mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Image URL (optional)"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />
            <Input
              placeholder="Description (optional)"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />

            <Button
              onClick={handleCreateProduct}
              className="w-full bg-brandGreen hover:bg-emerald-700 text-white"
            >
              Save Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
