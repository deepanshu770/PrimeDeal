import {
  Mail,
  Phone,
  Plus,
  User,
  Loader2,
  MapPin,
  Trash2,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ProfileInputState, userProfileSchema } from "@/schema/userSchema";
import { useUserStore } from "@/zustand/useUserStore";
import { useAddressStore } from "@/zustand/useAddressStore";
import { toast } from "sonner";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);

  // ---------------- Profile -----------------
  const [profileData, setProfileData] = useState<ProfileInputState>({
    fullname: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
  });

  const updateProfile = useUserStore((state) => state.updateProfile);
  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      setProfileData({
        fullname: user.fullname || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  const [errors, setErrors] = useState<Partial<ProfileInputState>>({});
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>(
    profileData.profilePicture || ""
  );

  // Image Upload
  const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedFile(result);
        setProfileData((prevData) => ({
          ...prevData,
          profilePicture: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Input Change
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationResult = userProfileSchema.safeParse(profileData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<ProfileInputState>);
      toast.error("Please fill all the details correctly before submitting.");
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile(validationResult.data);
      setIsLoading(false);
      toast.success("Profile updated successfully!");
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 border border-gray-300 dark:border-gray-700 p-8 rounded-2xl shadow-sm bg-white dark:bg-gray-900 transition-all">
      {/* ---------------- Profile Section ---------------- */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar Section */}
          <div className="relative w-28 h-28 md:w-32 md:h-32">
            <Avatar className="w-full h-full">
              <AvatarImage src={selectedFile || ""} />
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                {profileData.fullname?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <input
              ref={imageRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={fileChangeHandler}
            />
            <div
              onClick={() => imageRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-full cursor-pointer"
            >
              <Plus className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Name, Email, Phone */}
          <div className="flex flex-col w-full md:w-2/3 space-y-4">
            <ProfileField
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              name="fullname"
              value={profileData.fullname}
              onChange={changeHandler}
              error={errors.fullname}
            />
            <ProfileField
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              name="email"
              value={profileData.email}
              disabled
              error={errors.email}
            />
            <ProfileField
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              name="contact"
              value={profileData.phoneNumber}
              onChange={changeHandler}
              error={errors.phoneNumber}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brandGreen text-white px-8 py-2 hover:bg-brandGreen/80 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      <Separator className="my-10 bg-gray-300 dark:bg-gray-700" />

      {/* ---------------- Address Section ---------------- */}
      <AddressSection />
    </div>
  );
};

export default Profile;

/* ===========================================================
   📦 Profile Field Component
=========================================================== */
const ProfileField = ({
  icon,
  label,
  name,
  value,
  onChange,
  disabled,
  error,
}: {
  icon: JSX.Element;
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </Label>
    </div>
    <Input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={`Enter ${label}`}
      className="w-full border-b border-gray-400 bg-transparent focus:ring-0 focus:border-brandGreen dark:text-white"
    />
    {error && <span className="text-xs text-error">{error}</span>}
  </div>
);

/* ===========================================================
   🏠 Address Section Integrated with useAddressStore
=========================================================== */
const AddressSection = () => {
  const {
    addresses,
    getAddresses,
    loading,
    deleteAddress,
    setSelectedAddress,
    selectedAddress,
  } = useAddressStore();

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    getAddresses();
  }, [getAddresses]);

  const handleAdd = async () => {
    if (!form.addressLine1 || !form.city || !form.postalCode) {
      toast.error("Please fill all required address fields.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/v1/address", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address added!");
        setForm({
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
        });
        setAdding(false);
        await getAddresses();
      }
    } catch {
      toast.error("Failed to add address.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Saved Addresses
        </h2>
        <Button
          onClick={() => setAdding(!adding)}
          variant="outline"
          className="flex items-center gap-2 text-sm border-brandGreen text-brandGreen hover:bg-brandGreen/10"
        >
          <Plus className="w-4 h-4" /> Add Address
        </Button>
      </div>

      {adding && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-5 space-y-3 border border-gray-200 dark:border-gray-700">
          {["addressLine1", "city", "state", "postalCode"].map((field) => (
            <Input
              key={field}
              placeholder={field.replace("Line1", " Line 1")}
              value={(form as any)[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="text-sm"
            />
          ))}
          <Button onClick={handleAdd} className="bg-brandGreen text-white w-full">
            Save Address
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-brandGreen w-6 h-6" />
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          No addresses found.
        </p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => setSelectedAddress(addr)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedAddress?.id === addr.id
                  ? "border-brandGreen bg-brandGreen/5"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brandGreen" />
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {addr.city}, {addr.state}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {addr.addressLine1}, {addr.postalCode}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {addr.isDefault && (
                    <Star className="w-4 h-4 text-yellow-500"  />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(addr.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
