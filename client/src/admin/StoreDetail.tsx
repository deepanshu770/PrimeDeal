import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StoreInfoSchema } from "@/schema/storeSchema";
import { Shop } from "@/types/types";
import { useShopStore } from "@/zustand/useShopStore";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type InputType = Omit<Shop,'id'|'userId'>
const AdminStoreDetail = () => {
  const [input, setInput] = useState<InputType>({
    storeName: "",
    description: "",
    address: "",
    city: "",
    latitude: 0,
    longitude: 0,
    deliveryTime: 0,
    storeBanner: undefined,
  });

  const params = useParams();
  const navigate = useNavigate();
  const addingStore = params.id === "new";
  const [errors, setErrors] = useState<Partial<StoreInfoSchema>>({});
  const [locating, setLocating] = useState(false);

  const { loading, singleShop, createShop, updateShop, getSingleShop } =
    useShopStore();

  // 🔹 Handle Input Changes
  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInput({
      ...input,
      [name]:
        type === "number" ? Number(value) : (value as string | number | undefined),
    });
  };

  // 🔹 Handle Geolocation
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setInput((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch location. Please allow location access.");
        setLocating(false);
      }
    );
  };

  // 🔹 Submit Handler
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
  console.log('first')
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("storeName", input.storeName);
      formData.append("description", input.description || "");
      formData.append("address", input.address);
      formData.append("city", input.city);
      formData.append("latitude", input.latitude.toString());
      formData.append("longitude", input.longitude.toString());
      formData.append("deliveryTime", input.deliveryTime.toString());

      if (input.storeBanner instanceof File) {
        formData.append("storeBanner", input.storeBanner);
      }

      if (!addingStore && singleShop) {
        formData.append("storeId", singleShop.id.toString());
        await updateShop(formData, singleShop.storeBanner);
      } else {
        await createShop(formData);
      }

      navigate(-1);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 Fetch shop if editing
  useEffect(() => {
    const fetchShop = async () => {
      await getSingleShop(params.id!);
      if (singleShop) {
        setInput({
          storeName: singleShop.storeName || "",
          description: singleShop.description || "",
          address: singleShop.address || "",
          city: singleShop.city || "",
          latitude: singleShop.latitude || 0,
          longitude: singleShop.longitude || 0,
          deliveryTime: singleShop.deliveryTime || 0,
          storeBanner:
            typeof singleShop.storeBanner === "string"
              ? undefined
              : singleShop.storeBanner,
        });
      }
    };
    if (!addingStore) {
      fetchShop();
    } else {
      fetchCurrentLocation(); // auto fetch for new stores
    }
  }, [addingStore, params.id]);

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="font-extrabold text-3xl text-textPrimary dark:text-white mb-6 text-center">
        {addingStore ? "Add New Store" : "Update Store"}
      </h1>

      <form
        onSubmit={submitHandler}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start"
      >
        {/* Store Name */}
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
            <span className="text-xs text-error font-medium">{errors.storeName}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <Label className="mb-2 ml-1">Description</Label>
          <Input
            type="text"
            name="description"
            placeholder="Short store description"
            value={input.description}
            onChange={changeEventHandler}
          />
          {errors.description && (
            <span className="text-xs text-error font-medium">{errors.description}</span>
          )}
        </div>

        {/* Address */}
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
            <span className="text-xs text-error font-medium">{errors.address}</span>
          )}
        </div>

        {/* City */}
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
            <span className="text-xs text-error font-medium">{errors.city}</span>
          )}
        </div>

        {/* Latitude & Longitude with geolocation button */}
        <div className="flex flex-col relative">
          <Label className="mb-2 ml-1">Latitude</Label>
          <Input
            type="number"
            name="latitude"
            placeholder="Enter latitude"
            value={input.latitude}
            onChange={changeEventHandler}
          />
          {errors.latitude && (
            <span className="text-xs text-error font-medium">{errors.latitude}</span>
          )}
        </div>

        <div className="flex flex-col relative">
          <Label className="mb-2 ml-1">Longitude</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              name="longitude"
              placeholder="Enter longitude"
              value={input.longitude}
              onChange={changeEventHandler}
            />
            <Button
              type="button"
              size="icon"
              className="bg-brandGreen hover:bg-brandGreen/80 text-white"
              onClick={fetchCurrentLocation}
              disabled={locating}
            >
              {locating ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.longitude && (
            <span className="text-xs text-error font-medium">{errors.longitude}</span>
          )}
        </div>

        {/* Delivery Time */}
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
            <span className="text-xs text-error font-medium">
              {errors.deliveryTime}
            </span>
          )}
        </div>

        {/* Store Banner */}
        <div className="flex flex-col">
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
            <span className="text-xs text-error font-medium">
              {errors.storeBanner?.name}
            </span>
          )}
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-center mt-4">
          {loading ? (
            <Button
              disabled
              className="bg-brandGreen text-white w-full max-w-xs flex items-center justify-center gap-2"
            >
              <Loader2 className="animate-spin h-4 w-4" /> Please wait...
            </Button>
          ) : (
            <Button type="submit" className="bg-brandGreen hover:bg-brandGreen/80 text-white w-full max-w-xs">
              {addingStore ? "Add Store" : "Update Store"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminStoreDetail;
