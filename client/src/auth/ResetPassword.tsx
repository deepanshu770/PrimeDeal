import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Loader2, LockKeyhole, } from "lucide-react";
import { useState } from "react"
import { Link } from "react-router-dom";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState<string>("");
    const loading: boolean = false;
    return (
        <div className="flex items-center justify-center min-h-screen ">
            <form className="flex flex-col gap-5 md:p-8 w-full max-w-md rounded-lg mx-4 bg-white">
                <div className="text-center">
                    <h1 className="font-extrabold text-2xl text-textPrimary mb-2">Reset Password</h1>
                    <p className="text-sm text-textSecondary">
                        Enter your new password and we will send you a link to reset your password.
                    </p>
                </div>

                {/* Email Input Field */}
                <div className="relative w-full">
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="pl-10 border border-gray-300  focus:ring-1 focus:ring-brandOrange text-textPrimary bg-backgroundLight rounded-md py-2"
                    />
                    <LockKeyhole className="absolute inset-y-2 left-2 text-textSecondary pointer-events-none" />
                </div>
                {
                    loading ? (
                        <Button disabled className="w-full bg-brandOrange text-white py-2 rounded-md hover:bg-opacity-90 transition border-transparent focus-visible:outline-noner-transparent"><Loader2 className="animate-spin mr-2 h-4 w-4" /> Sending...</Button>
                    ) : (
                        <Button className="w-full bg-brandOrange text-white py-2 rounded-md hover:bg-opacity-90 transition  focus:border-brandOrange focus-visible:outline-noner-transparent " onClick={() => { }}>Reset</Button>
                    )
                }
                <span>
                    Back to{" "}
                    <Link
                        to="/Login"
                        className="text-brandGreen hover:text-[#00664A] focus:text-[#00664A] transition focus:outline-none focus:ring-0"
                    >
                        Login
                    </Link>
                </span>
            </form>
        </div>
    )
}

export default ResetPassword;