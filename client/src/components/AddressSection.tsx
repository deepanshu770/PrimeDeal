import { MapPin, Plus, Star, Edit, Trash } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useAddressStore } from "@/zustand/useAddressStore";

function AddressSection() {
  const { loading, addresses, getAddress } = useAddressStore();

  useEffect(() => {
    getAddress();
  }, []);
  const handleAddNewAddress = () => {};

  const handleDeleteAddress = (id: number) => {
    toast.success("Address deleted");
  };

  const handleMakeDefault = (id: number) => {};
  if (loading) return <AddressSkeleton />;
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brandOrange" />
          Saved Addresses
        </h2>
        <Button
          onClick={handleAddNewAddress}
          className="bg-brandOrange text-white hover:bg-opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Address
        </Button>
      </div>

      <div className="grid gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="border border-gray-300 rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {addr.addressLine1}
              </p>
              {addr.addressLine2 && (
                <p className="text-sm text-gray-600">{addr.addressLine2}</p>
              )}
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.state}, {addr.postalCode}
              </p>
              <p className="text-sm text-gray-600">{addr.country}</p>

              {addr.isDefault && (
                <span className="inline-block mt-2 text-xs bg-brandOrange text-white px-2 py-1 rounded-full">
                  Default
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {!addr.isDefault && (
                <Button
                  onClick={() => handleMakeDefault(addr.id)}
                  variant="outline"
                  className="text-brandOrange border-brandOrange hover:bg-brandOrange hover:text-white"
                >
                  <Star className="w-4 h-4 mr-1" /> Make Default
                </Button>
              )}
              <Button
                variant="outline"
                className="text-gray-600 border-gray-400"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-red-500 border-red-400"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddressSection;

const AddressSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-pulse">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-300 rounded-lg p-4 shadow-sm flex flex-col justify-between space-y-3"
        >
          <div className="h-5 w-1/2 bg-gray-300 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
          <div className="flex justify-end mt-4 space-x-2">
            <div className="h-8 w-16 bg-gray-300 rounded"></div>
            <div className="h-8 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
