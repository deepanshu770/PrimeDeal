import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, MapPin, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShopStore } from "@/zustand/useShopStore";
import { toast } from "sonner";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import type { Shop } from "@/types/types";

type InputType = Omit<Shop, "id" | "userId">;

const mapContainerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 23.2599, lng: 77.4126 }; // default: Bhopal

const AdminStoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addingStore = id === "new";
  const { loading, createShop, updateShop } = useShopStore();

  const [preview, setPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [input, setInput] = useState<InputType>({
    storeName: "",
    description: "",
    address: "",
    city: "",
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    deliveryTime: 0,
    storeBanner: "",
  });

  // ✅ Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  // ✅ Prefill when editing
  useEffect(() => {
    if (!addingStore && id) {
      const shop = useShopStore.getState().shop.find((s) => s.id == Number(id));
      if (shop) {
        setInput({
          storeName: shop.storeName,
          description: shop.description,
          address: shop.address,
          city: shop.city,
          latitude: shop.latitude,
          longitude: shop.longitude,
          deliveryTime: shop.deliveryTime,
          storeBanner: shop.storeBanner,
        });
        setPreview(shop.storeBanner);
      } else toast.error("Something went wrong!");
    }
  }, [addingStore, id]);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files?.[0]) {
      const file = files[0];
      setInput((prev) => ({ ...prev, storeBanner: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setInput((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  // ✅ Get current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setInput((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        toast.success("Location detected successfully!");
        setLocating(false);
      },
      (err) => {
        toast.error("Failed to get location: " + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // ✅ Validation
  const validate = () => {
    if (
      !input.storeName.trim() ||
      !input.description.trim() ||
      !input.address.trim() ||
      !input.city.trim() ||
      !input.latitude ||
      !input.longitude ||
      !input.storeBanner
    ) {
      toast.error("Please fill all fields and add a banner.");
      return false;
    }
    return true;
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        formData.append(key, String(value));
    });
    if (input.storeBanner instanceof File)
      formData.set("storeBanner", input.storeBanner);

    try {
      if (addingStore) {
        await createShop(formData);
      } else if (id && !isNaN(Number(id))) {
        formData.append("shopId", id.toString());
        await updateShop(formData, input.storeBanner || "");
      }
      toast.success("Store saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-brandGreen" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-brandGreen">
          {addingStore ? "Add New Store" : "Edit Store"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Store Name</Label>
              <Input
                name="storeName"
                value={input.storeName}
                onChange={handleChange}
                placeholder="Enter store name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                name="description"
                value={input.description}
                onChange={handleChange}
                placeholder="Enter store description"
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Address</Label>
              <Input
                name="address"
                value={input.address}
                onChange={handleChange}
                placeholder="Enter store address"
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                name="city"
                value={input.city}
                onChange={handleChange}
                placeholder="Enter city name"
              />
            </div>
          </div>

          {/* ✅ Google Map Picker */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Select Store Location</Label>
              <Button
                type="button"
                onClick={handleCurrentLocation}
                disabled={locating}
                className="flex items-center gap-2 bg-brandGreen text-white"
              >
                {locating ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                {locating ? "Detecting..." : "Get Current Location"}
              </Button>
            </div>

            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={14}
              center={{ lat: input.latitude, lng: input.longitude }}
              onClick={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setInput((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                }
              }}
            >
              <Marker
                position={{ lat: input.latitude, lng: input.longitude }}
                draggable
                onDragEnd={(e) => {
                  if (e.latLng) {
                    setInput((prev) => ({
                      ...prev,
                      latitude: e.latLng.lat(),
                      longitude: e.latLng.lng(),
                    }));
                  }
                }}
              />
            </GoogleMap>

            <p className="text-sm text-gray-500 mt-2">
              Latitude: {input.latitude.toFixed(6)} | Longitude:{" "}
              {input.longitude.toFixed(6)}
            </p>
          </div>

          {/* Banner Upload */}
          <div>
            <Label>Store Banner</Label>
            <Input
              name="storeBanner"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            <div className="flex justify-center mt-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-72 h-44 object-cover rounded-xl shadow-md"
                />
              ) : (
                <div className="w-72 h-44 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400">
                  <ImageIcon className="w-10 h-10 opacity-60" />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-brandGreen text-white flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" /> Saving...
                </>
              ) : addingStore ? (
                "Add Store"
              ) : (
                "Update Store"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreDetail;
