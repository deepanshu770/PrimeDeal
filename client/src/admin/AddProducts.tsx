import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { unitOptions } from "@/config/data";
import { useProductStore } from "@/zustand/useProductStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_END_POINT } from "@/config/varibles";

export default function AddProduct() {
  const navigate = useNavigate();
  const { createCatalogProduct, loading } = useProductStore();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    categoryId: "",
    netQty: "",
    unit: "pcs",
    image: null as File | null,
  });

  // Fetch categories
  useEffect(() => {
    axios
      .get(`${API_END_POINT}/product/category`)
      .then((res) => {
        if (res.data.success) setCategories(res.data.categories);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async () => {
    const { name, categoryId, description, brand, netQty, unit, image } = formData;

    if (!name || !categoryId || !netQty || !unit) {
      toast.error("Please fill all required fields");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("categoryId", categoryId);
    fd.append("description", description);
    fd.append("brand", brand);
    fd.append("netQty", netQty);
    fd.append("unit", unit);
    if (image) fd.append("image", image);

    try {
      await createCatalogProduct(fd);
      toast.success("✅ Product added successfully");
      navigate(-1);
    } catch {
      toast.error("Failed to create product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-10 flex justify-center">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            ➕ Add New Product
          </h1>

          <div className="space-y-3">
            <Input
              name="name"
              placeholder="Product Name *"
              value={formData.name}
              onChange={handleChange}
              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Textarea
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={(e) => handleChange(e)}
              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Input
              name="brand"
              placeholder="Brand (optional)"
              value={formData.brand}
              onChange={handleChange}
              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />

            {/* Category */}
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border rounded-md p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            >
              <option value="">Select Category *</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Net Quantity + Unit */}
            <div className="flex gap-2">
              <Input
                name="netQty"
                placeholder="Net Quantity (e.g. 500)"
                type="number"
                value={formData.netQty}
                onChange={handleChange}
                className="flex-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="border rounded-md p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-brandGreen hover:bg-emerald-700 text-white"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Add Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
