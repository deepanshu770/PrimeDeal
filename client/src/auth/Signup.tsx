import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignupInputState, userSignupSchema } from "@/schema/userSchema";
import { useUserStore } from "@/zustand/useUserStore";
import { Loader2, LockKeyhole, Mail, Phone, User2 } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// type SignupInputState = {
//     fullname: string;
//     email: string;
//     password: string;
//     contact: string;
// };

const Signup = () => {
    const [input, setInput] = useState<SignupInputState>({
        fullname: "",
        email: "",
        password: "",
        contact: "",
    });

    const [errors, setErrors] = useState<Partial<SignupInputState>>({});

    const signup = useUserStore((state) => state.signup);
    const loading = useUserStore((state) => state.loading);
    const navigate = useNavigate();

    const changeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };
    const loginSubmitHandler = async(e: FormEvent) => {
        e.preventDefault();
        // form validation check start
        const formData = userSignupSchema.safeParse(input);
        if (!formData.success) {
            const fieldErrors = formData.error.formErrors.fieldErrors;
            setErrors(fieldErrors as Partial<SignupInputState>);
            return;
        }
        // login API Implementation
        try {
            await signup(input);
            navigate("/profile");
        } catch (error) {
            console.log(error);
        }
        
    };
    

    return (

        <div className="flex items-center justify-center min-h-screen">

            <form onSubmit={loginSubmitHandler} className="md:p-8 w-full max-w-md  rounded-lg md:border border-gray-200 mx-4 ">
                <div className="mb-4">
                    <h1 className="font-bold text-2xl text-textPrimary dark:text-white">Prime Deal</h1>
                </div>
                {/* Full name Input */}
                <div className="mb-4">
                    <div className="relative">
                        <Input
                            type="text"
                            name="fullname"
                            placeholder="Enter your full name"
                            value={input.fullname}
                            onChange={changeEventHandler}
                            className="pl-10 border border-gray-300 focus:ring-1 focus:ring-brandOrange text-textPrimary bg-backgroundLight"
                        />
                        <User2 className="absolute inset-y-2 left-2 text-textSecondary pointer-events-none" />
                         {
                            errors && <span className="text-xs text-error">{errors.fullname}</span>
                         }
                    </div>
                </div>
                {/* Contact Input */}
                <div className="mb-4">
                    <div className="relative">
                        <Input
                            type="text"
                            name="contact"
                            placeholder="Enter your contact number"
                            value={input.contact}
                            onChange={changeEventHandler}
                            className="pl-10 border border-gray-300 focus:ring-1 focus:ring-brandOrange text-textPrimary bg-backgroundLight"
                        />
                        <Phone className="absolute inset-y-2 left-2 text-textSecondary pointer-events-none" />
                        {
                            errors && <span className="text-xs text-error">{errors.contact}</span>
                         }
                    </div>
                </div>

                {/* Email Input */}
                <div className="mb-4">
                    <div className="relative">
                        <Input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={input.email}
                            onChange={changeEventHandler}
                            className="pl-10 border border-gray-300 focus:ring-1 focus:ring-brandOrange text-textPrimary bg-backgroundLight"
                        />
                        <Mail className="absolute inset-y-2 left-2 text-textSecondary pointer-events-none" />
                        {
                            errors && <span className="text-xs text-error">{errors.email}</span>
                         }
                    </div>
                </div>

                {/* Password Input */}
                <div className="mb-4">
                    <div className="relative">
                        <Input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={input.password}
                            onChange={changeEventHandler}
                            className="pl-10 border border-gray-300 focus:ring-1 focus:ring-brandOrange text-textPrimary bg-backgroundLight"
                        />
                        <LockKeyhole className="absolute inset-y-2 left-2 text-textSecondary pointer-events-none" />
                        {
                            errors && <span className="text-xs text-error">{errors.password}</span>
                         }
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mb-4">
                    {
                        loading ? <Button disabled className="w-full bg-brandOrange text-white py-2 rounded-md hover:bg-opacity-90 transition border-transparent focus-visible:outline-noner-transparent">
                            <Loader2 className="animate-spin h-4 w-4" /> Please wait...
                        </Button> : (
                            <Button type="submit" className="w-full bg-brandOrange text-white py-2 rounded-md hover:bg-opacity-90 transition border-transparent focus-visible:outline-noner-transparent">Signup</Button>
                        )
                    }

                </div>
                <Separator />
                {/* Additional Links (Forgot Password, Sign Up) */}
                <p className="m-2">Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-brandGreen text-sm no-underline hover:no-underline hover:text-brandGreen"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;