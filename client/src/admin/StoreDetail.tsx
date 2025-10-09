import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StoreInfoSchema, storeSchema } from "@/schema/storeSchema";
import { useShopStore } from "@/zustand/useShopStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminStoreDetail = () => {
  const [input, setInput] = useState<StoreInfoSchema>({
    storeName: "",
    address: "",
    city: "",
    deliveryTime: 0,
    products: [],
    storeBanner: undefined,
  });
  const params = useParams();
  const navigate = useNavigate();
const addingStore = params.id === "new";

  const [errors, setErrors] = useState<Partial<StoreInfoSchema>>({});
  const { loading, singleShop, createShop, updateShop, getSingleShop } = useShopStore();

  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInput({ ...input, [name]: type === "number" ? Number(value) : value });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = storeSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<StoreInfoSchema>);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("storeName", input.storeName);
      formData.append("address", input.address);
      formData.append("city", input.city);
      formData.append("deliveryTime", input.deliveryTime.toString());
      formData.append("productCategory", JSON.stringify(input.products));

      if (input.storeBanner instanceof File) {
        formData.append("storeBanner", input.storeBanner);
      }

      if (!addingStore && singleShop) {
        formData.append("storeId",singleShop.id);
        await updateShop(formData, singleShop.storeBanner);
        
      } else {
        await createShop(formData);
      }
      navigate(-1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchShop = async () => {
      await getSingleShop(params.id!);
      if (singleShop) {
        setInput({
          storeName: singleShop.name || "",
          address: singleShop.address || "",
          city: singleShop.cityName || "",
          deliveryTime: singleShop.deliveryTime || 0,
          products: singleShop.productCategory
            ? singleShop.productCategory.map((product: string) => product)
            : [],
          storeBanner:
            typeof singleShop.storeBanner === "string" ? undefined : singleShop.storeBanner,
        });
      }
    };
    if(!addingStore){
        fetchShop();
    }
  }, [addingStore, params.id]);

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="font-extrabold text-3xl text-textPrimary dark:text-white mb-6 text-center">
        {!addingStore ? "Update Store" : "Add New Store"}
      </h1>

      <form
        onSubmit={submitHandler}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start"
      >
        <div className="flex flex-col">
          <Label className="mb-2 ml-1">Store Name</Label>
          <Input
            type="text"
            name="storeName"
            placeholder="Enter store name"
            value={input.storeName}
            onChange={changeEventHandler}
          />
          {errors.storeName && (
            <span className="text-xs text-error font-medium ">
              {errors.storeName}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <Label className="mb-2 ml-1">Address</Label>
          <Input
            type="text"
            name="address"
            placeholder="Enter store address"
            value={input.address}
            onChange={changeEventHandler}
          />
          {errors.address && (
            <span className="text-xs text-error font-medium ">
              {errors.address}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <Label className="mb-2 ml-1">City</Label>
          <Input
            type="text"
            name="city"
            placeholder="Enter city"
            value={input.city}
            onChange={changeEventHandler}
          />
          {errors.city && (
            <span className="text-xs text-error font-medium ">
              {errors.city}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <Label className="mb-2 ml-1">Delivery Time (mins)</Label>
          <Input
            type="number"
            name="deliveryTime"
            placeholder="Estimated delivery time"
            value={input.deliveryTime}
            onChange={changeEventHandler}
          />
          {errors.deliveryTime && (
            <span className="text-xs text-error font-medium ">
              {errors.deliveryTime}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:col-span-2 gap-6">
          <div className="flex flex-col w-full">
            <Label className="mb-2 ml-1">Products</Label>
            <Input
              type="text"
              name="products"
              placeholder="e.g. Pulses, Dals, etc"
              value={input.products}
              onChange={(e) =>
                setInput({ ...input, products: e.target.value.split(",") })
              }
            />
            {errors.products && (
              <span className="text-xs text-error font-medium ">
                {errors.products}
              </span>
            )}
          </div>
          <div className="flex flex-col w-full">
            <Label className="mb-2 ml-1">Upload Store Banner</Label>
            <Input
              type="file"
              accept="image/*"
              name="storeBanner"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setInput((prev) => ({
                  ...prev,
                  storeBanner: file || prev.storeBanner,
                }));
              }}
            />
            {errors.storeBanner && (
              <span className="text-xs text-error font-medium ">
                {errors.storeBanner?.name}
              </span>
            )}
          </div>
        </div>
        <div className="md:col-span-2 flex justify-center mt-4">
          {loading ? (
            <Button
              disabled
              className="bg-brandGreen text-white w-full max-w-xs flex items-center justify-center gap-2"
            >
              <Loader2 className="animate-spin h-4 w-4" /> Please wait...
            </Button>
          ) : (
            <Button className="bg-brandGreen hover:bg-brandGreen/80 text-white w-full max-w-xs">
              {loading ?"Loading" :(!addingStore ? "Update Store" : "Add Store")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminStoreDetail;
