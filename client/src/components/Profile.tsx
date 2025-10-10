import {
  Mail,
  Phone,
  Plus,
  User,
  Loader2,
  MapPin,
  Edit,
  Trash,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ProfileInputState, userProfileSchema } from "@/schema/userSchema";
import { useUserStore } from "@/zustand/useUserStore";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@radix-ui/react-separator";
import AddressSection from "./AddressSection";

interface Address {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);

  // ---------------- Profile -----------------
  const [profileData, setProfileData] = useState<ProfileInputState>({
    fullname: "",
    email: "",
    contact: "",
    profilePicture: "",
  });

  const updateProfile = useUserStore((state) => state.updateProfile);

  useEffect(() => {
    const user = useUserStore.getState().user;
    setProfileData({
      fullname: user?.fullname || "",
      email: user?.email || "",
      contact: user?.phoneNumber || "",
      profilePicture: user?.profilePicture || "",
    });
  }, []);

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
        setProfileData((prevData: any) => ({
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
    } catch (error) {
      setIsLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto my-10 border border-gray-300 p-8 rounded-lg">
      {/* ---------------- Profile Section ---------------- */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="flex flex-col md:flex-row items-center gap-8 mt-12 md:mt-0">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Avatar className="w-full h-full">
                <AvatarImage src={selectedFile || ""} />
                <AvatarFallback>BP</AvatarFallback>
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

            {/* Full Name */}
            <div className="flex flex-col w-full md:w-2/5">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-5 h-5 text-textPrimary dark:text-white" />
                <Label className="text-textPrimary text-sm dark:text-white">
                  Full Name
                </Label>
              </div>
              <Input
                type="text"
                name="fullname"
                value={profileData.fullname}
                onChange={changeHandler}
                placeholder="Enter Full Name"
                className="w-full border-b border-gray-400 outline-none focus:ring-0"
              />
              {errors.fullname && (
                <span className="text-xs text-error">{errors.fullname}</span>
              )}
            </div>
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-5 h-5 text-textPrimary dark:text-white" />
              <Label className="text-textPrimary text-sm dark:text-white">
                Email
              </Label>
            </div>
            <Input
              disabled
              type="text"
              name="email"
              value={profileData.email}
              placeholder="Enter Email"
              className="w-full border-b border-gray-400 outline-none focus:ring-0"
            />
            {errors.email && (
              <span className="text-xs text-error">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-5 h-5 text-textPrimary dark:text-white" />
              <Label className="text-textPrimary text-sm dark:text-white">
                Phone
              </Label>
            </div>
            <Input
              type="text"
              name="contact"
              value={profileData.contact}
              onChange={changeHandler}
              placeholder="Enter Phone Number"
              className="w-full border-b border-gray-400 outline-none focus:ring-0"
            />
            {errors.contact && (
              <span className="text-xs text-error">{errors.contact}</span>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brandOrange text-white px-8 py-2 hover:bg-opacity-90 transition"
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

 <Separator className="my-10 bg-gray-300" />
      {/* ---------------- Address Section ---------------- */}
     
    <AddressSection/>

      
    </div>
  );
};

export default Profile;
