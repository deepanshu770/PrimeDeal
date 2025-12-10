import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAddressStore } from "@/zustand/useAddressStore";
import { Address } from "../../../types/types";
import { toast } from "sonner";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "280px",
  borderRadius: "0.75rem",
};

const defaultCenter = { lat: 23.2599, lng: 77.4126 }; // Bhopal

const SetupAddress = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading, addAddress, updateAddress } = useAddressStore();
  

  const [address, setAddress] = useState<Omit<Address, "id">>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    isDefault: false,
  });

  const [locating, setLocating] = useState(false);

  // ⭐ Load Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  // ⭐ Reverse Geocode (OpenStreetMap)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      if (data?.address) {
        const addr = data.address;

        setAddress((prev) => ({
          ...prev,
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          postalCode: addr.postcode || "",
          country: addr.country || "",
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  // Prefill when editing
  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      const _id = Number(id);
      const found = useAddressStore
        .getState()
        .addresses.find((a) => a.id === _id);
      if (found) {
        setAddress(found);
      }
    }
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  // ⭐ Use My Location + reverse geocode
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setAddress((prev) => ({ ...prev, latitude, longitude }));
        await reverseGeocode(latitude, longitude);

        setLocating(false);
      },
      (err) => {
        toast.error("Failed: " + err.message);
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!address.latitude || !address.longitude) {
      toast.warning("Please Provide Location !");
      return;
    }

    try {
      if (useAddressStore.getState().addresses.length === 0) {
        address.isDefault = true;
      }

      if (id) {
        await updateAddress(Number(id), address);
        navigate(-1);
      } else {
        await addAddress(address);
        navigate('/profile');
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-8 w-8 text-brandOrange" />
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="md:p-8 w-full max-w-md rounded-lg md:border border-gray-200 mx-4"
      >
        <div className="mb-4">
          <h1 className="font-bold text-2xl">Prime Deal</h1>
          <p className="text-sm">Set up your delivery address</p>
        </div>

        {/* ⭐ LOCATION PICKER */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <p className="font-medium text-gray-700">Select Location</p>

            <Button
              type="button"
              variant="outline"
              onClick={handleUseMyLocation}
              disabled={locating}
              className="flex items-center gap-2 text-brandOrange border-brandOrange hover:bg-brandOrange hover:text-white"
            >
              {locating ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {locating ? "Locating..." : "Use My Location"}
            </Button>
          </div>

          {/* ⭐ GOOGLE MAP */}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={{ lat: address.latitude!, lng: address.longitude! }}
            onClick={(e) => {
              const lat = e.latLng!.lat();
              const lng = e.latLng!.lng();
              setAddress((prev) => ({ ...prev, latitude: lat, longitude: lng }));
              reverseGeocode(lat, lng);
            }}
          >
            <Marker
              position={{ lat: address.latitude!, lng: address.longitude! }}
              draggable
              onDragEnd={(e) => {
                const lat = e.latLng!.lat();
                const lng = e.latLng!.lng();
                setAddress((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                reverseGeocode(lat, lng);
              }}
            />
          </GoogleMap>

          <p className="text-xs text-gray-500 mt-1">
            Lat: {address.latitude?.toFixed(6)} | Lng:{" "}
            {address.longitude?.toFixed(6)}
          </p>
        </div>

        {/* ADDRESS FIELDS */}
        <div className="space-y-4">
          <Input
            name="addressLine1"
            placeholder="Address Line 1"
            value={address.addressLine1}
            onChange={handleChange}
            required
          />
          <Input
            name="addressLine2"
            placeholder="Address Line 2 (Optional)"
            value={address.addressLine2}
            onChange={handleChange}
          />
          <Input
            name="city"
            placeholder="City"
            value={address.city}
            onChange={handleChange}
            required
          />
          <Input
            name="state"
            placeholder="State"
            value={address.state}
            onChange={handleChange}
            required
          />
          <Input
            name="postalCode"
            placeholder="Postal Code"
            value={address.postalCode}
            onChange={handleChange}
            required
          />
          <Input
            name="country"
            placeholder="Country"
            value={address.country}
            onChange={handleChange}
            required
          />
        </div>

        {/* SUBMIT */}
        <div className="mt-6 mb-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brandOrange text-white py-2"
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Save Address"
            )}
          </Button>
        </div>

        <Separator />
        <p className="m-2 text-center text-sm text-gray-500">
          You can edit your address later.
        </p>
      </form>
    </div>
  );
};

export default SetupAddress;
