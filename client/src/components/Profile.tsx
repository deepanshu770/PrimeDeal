import { Mail, Phone, Home, Plus, User, Loader2, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ProfileInputState, userProfileSchema } from "@/schema/userSchema";
import { useUserStore } from "@/zustand/useUserStore";
import { toast } from "sonner";

const Profile = () => {
    const { user, toggleAdmin, } = useUserStore();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [adminLoading, setAdminLoading] = useState<boolean>(false);
    {/* Profile Data State */ }
    const [profileData, setProfileData] = useState<ProfileInputState>({
        fullname: user?.fullname || "",
        email: user?.email || "",
        contact: user?.contact || "",
        address: user?.address || "",
        city: user?.city || "",
        profilePicture: user?.profilePicture || "",
    });

    const updateProfile = useUserStore((state) => state.updateProfile);
    {/* Form Errors State */ }
    const [errors, setErrors] = useState<Partial<ProfileInputState>>({});

    {/* Success Message State */ }
    const [successMessage] = useState<string | null>(null);

    {/* Image Upload State */ }
    const imageRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<string>(profileData.profilePicture || "");

    {/* Image Upload Handler */ }
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

    {/* Form Data Change Handler */ }
    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    {/* Form Submit Handler */ }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationResult = userProfileSchema.safeParse(profileData);

        if (!validationResult.success) {
            // Extract errors and update state
            const fieldErrors = validationResult.error.formErrors.fieldErrors;
            setErrors(fieldErrors as Partial<ProfileInputState>);
            toast.error("Please fill all the details correctly before submitting.");
            return;
        }
        try {
            setIsLoading(true);
            await updateProfile(validationResult.data);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const setAdmin = async () => {
        try {
            setAdminLoading(true);
            await toggleAdmin();
            setAdminLoading(false);
        } catch (error) {
            setAdminLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto my-10 border border-gray-300 p-8 rounded-lg">
            {/* Profile Header with Admin Toggle Button moved to top-right */}
            <div className="relative">
                {/* Admin Toggle Button */}
                <div className="absolute top-0 right-0">
                    <Button
                        type="button"
                        onClick={setAdmin}
                        disabled={adminLoading} // ✅ Disable button when loading
                        className={`px-4 py-2 text-sm md:px-6 md:py-2 rounded-md text-white transition ${adminLoading
                                ? "bg-gray-400 cursor-not-allowed" // ✅ Loading state styling
                                : "bg-green-600 hover:bg-green-700"
                            } w-full sm:w-auto`} // ✅ Make button responsive
                    >
                        {adminLoading? "Processing..." : user?.admin ? "Switch to Normal User" : "Be an Admin"}
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 mt-12 md:mt-0">
                    {/* Avatar Section */}
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

                    {/* Full Name Input */}
                    <div className="flex flex-col w-full md:w-2/5">
                        <div className="flex items-center gap-2 mb-1">
                            <User className="w-5 h-5 text-textPrimary dark:text-white" />
                            <Label className="text-textPrimary text-sm dark:text-white">Full Name</Label>
                        </div>
                        <Input
                            type="text"
                            name="fullname"
                            value={profileData.fullname}
                            onChange={changeHandler}
                            placeholder="Enter Full Name"
                            className="w-full border-b border-gray-400 outline-none focus:ring-0"
                        />
                        {
                            errors && <span className="text-xs text-error">{errors.fullname}</span>
                        }
                    </div>
                </div>
            </div>

            {/* Profile Details (Now in 2x2 Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Email Field */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-5 h-5 text-textPrimary dark:text-white" />
                        <Label className="text-textPrimary text-sm dark:text-white">Email</Label>
                    </div>
                    <Input
                        disabled
                        type="text"
                        name="email"
                        value={profileData.email}
                        onChange={changeHandler}
                        placeholder="Enter Email"
                        className="w-full border-b border-gray-400 outline-none focus:ring-0"
                    />
                    {
                        errors && <span className="text-xs text-error">{errors.email}</span>
                    }
                </div>

                {/* Phone Field */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-5 h-5 text-textPrimary dark:text-white" />
                        <Label className="text-textPrimary text-sm dark:text-white">Phone</Label>
                    </div>
                    <Input
                        type="text"
                        name="contact"
                        value={profileData.contact}
                        onChange={changeHandler}
                        placeholder="Enter Phone Number"
                        className="w-full border-b border-gray-400 outline-none focus:ring-0"
                    />
                    {
                        errors && <span className="text-xs text-error ">{errors.contact}</span>
                    }
                </div>

                {/* Address Field */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Home className="w-5 h-5 text-textPrimary dark:text-white" />
                        <Label className="text-textPrimary text-sm dark:text-white">Address</Label>
                    </div>
                    <Input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={changeHandler}
                        placeholder="Enter Address"
                        className="w-full border-b border-gray-400 outline-none focus:ring-0"
                    />
                    {
                        errors && <span className="text-xs text-error">{errors.address}</span>
                    }
                </div>

                {/* City Field */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-5 h-5 text-textPrimary dark:text-white" />
                        <Label className="text-textPrimary text-sm dark:text-white">City</Label>
                    </div>
                    <Input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={changeHandler}
                        placeholder="Enter City"
                        className="w-full border-b border-gray-400 outline-none focus:ring-0"
                    />
                    {
                        errors && <span className="text-xs text-error">{errors.city}</span>
                    }
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
                {isLoading ? (
                    <Button
                        type="submit"
                        disabled
                        className="bg-brandOrange text-white px-8 py-2 hover:bg-opacity-90 transition"
                    >
                        <Loader2 className="animate-spin mr-2 w-4 h-4" /> Saving...
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        className="bg-brandOrange text-white px-8 py-2 hover:bg-opacity-90 transition"
                    >
                        Save Changes
                    </Button>
                )}
            </div>
            {/* Success Alert */}
            {successMessage && (
                <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
                    {successMessage}
                </div>
            )}
        </form>
    );
};

export default Profile;
