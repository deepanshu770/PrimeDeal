import {
  Mail,
  Phone,
  Plus,
  User,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ProfileInputState, userProfileSchema } from "@/schema/userSchema";
import { useUserStore } from "@/zustand/useUserStore";
import { toast } from "sonner";
import AddressSection from "./AddressSection";

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
              <AvatarImage src={selectedFile || profileData.profilePicture} />
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

