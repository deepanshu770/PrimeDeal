import { useEffect, useState } from "react";
import { useProductStore } from "@/zustand/useProductStore";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ghost, Loader2, Pencil, Search } from "lucide-react";

export default function InventoryEdit() {
  const { id: shopId } = useParams();
  const { shopInventory, loading, fetchProductsByShop, updateShopInventory } =
    useProductStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [search, setSearch] = useState(""); // 🔍 new state

  const [form, setForm] = useState({
    price: "",
    quantity: "",
    netQtyValue: "",
    unit: "",
    isAvailable: true,
  });

  useEffect(() => {
    if (shopId) {
      fetchProductsByShop(Number(shopId));
    }
  }, [shopId, fetchProductsByShop]);

  const openEditModal = (inventory: any) => {
    setSelectedProduct(inventory);

    setForm({
      price: String(inventory.price),
      quantity: String(inventory.quantity),
      netQtyValue: String(inventory.netQty),
      unit: inventory.unit,
      isAvailable: inventory.isAvailable,
    });

    setModalOpen(true);
  };

  const submitEdit = async () => {
    if (!selectedProduct && !shopId) return;

    await updateShopInventory(Number(shopId), selectedProduct.id, {
      price: Number(form.price),
      quantity: Number(form.quantity),
      netQtyValue: Number(form.netQtyValue),
      unit: form.unit,
      isAvailable: form.isAvailable,
    });

    setModalOpen(false);
    if (shopId) fetchProductsByShop(Number(shopId));
  };

  // // 🔍 Filtered list
  // const filteredInventory = shopInventory.filter((item) => {
  //   const q = search.toLowerCase();
    
  //   return (
  //     item?.name.toLowerCase().includes(q) ||
  //     String(item.price).includes(q) ||
  //     String(item.netQty).includes(q) ||
  //     item.unit.toLowerCase().includes(q) ||
  //     (item.category || "").toLowerCase().includes(q)
  //   );
  // });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-brandOrange" />
      </div>
    );
  }
  if (shopInventory.length===0) {
    return (
     <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Ghost className="w-20 h-20 text-gray-400 dark:text-gray-500 animate-float mb-4" />
      <div>
        <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
          No product in your shop.
          Add products from Product Catalog (in Menu)
        </h1>
      
      </div>
    </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-textPrimary dark:text-white">
        Inventory Management
      </h1>

      {/* 🔍 Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-3 text-gray-500 h-5 w-5" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10 bg-backgroundLight border-gray-300 focus:ring-brandOrange"
        />
      </div>

      {/* LIST */}
      <div className="space-y-5">
        {shopInventory.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-5 border border-gray-300 rounded-2xl shadow-md bg-white dark:bg-gray-900 hover:shadow-lg transition-all"
          >
            {/* IMAGE FIX */}
            <div className="w-24 h-24 rounded-xl overflow-hidden border bg-gray-100 shadow-sm">
              <img
                src={(item as any).image ?? item.product?.image ?? "/placeholder.png"}
                alt={(item as any).name ?? item.product?.name ?? "Product image"}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
            </div>

            {/* INFO */}
            <div className="flex-1">
              <div className="flex items-center justify-center gap-2 flex-row">
                <h2 className="font-semibold text-xl text-textPrimary dark:text-white">
                  {item.name} 
                </h2>
                <p className="text-sm text-gray-500">
                  ({item.netQty} {item.unit})
                </p>
              </div>

              <p className="mt-2 font-bold text-brandGreen text-xl">
                ₹ {item.price}
              </p>

              <p className="text-sm text-gray-600">Stock: {item.quantity}</p>

              <p
                className={`text-xs font-semibold mt-1 ${
                  item.isAvailable ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-brandOrange text-brandOrange hover:bg-brandOrange hover:text-white transition flex items-center gap-2"
              onClick={() => openEditModal(item)}
            >
              <Pencil size={14} /> Edit
            </Button>
          </div>
        ))}

        {shopInventory.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No products found.</p>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-textPrimary dark:text-white">
              Edit Inventory
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Price (₹)</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                type="number"
              />
            </div>

            <div>
              <Label>Stock Quantity</Label>
              <Input
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                type="number"
              />
            </div>

            <div>
              <Label>Net Quantity</Label>
              <Input
                value={form.netQtyValue}
                onChange={(e) =>
                  setForm({ ...form, netQtyValue: e.target.value })
                }
                type="number"
              />
            </div>

            <div>
              <Label>Unit</Label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm({ ...form, isAvailable: e.target.checked })
                }
                className="h-4 w-4 accent-brandOrange"
              />
              <Label>Available</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={submitEdit}
              disabled={loading}
              className="bg-brandOrange hover:bg-hoverOrange text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
