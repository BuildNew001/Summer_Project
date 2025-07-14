import React, { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const formSchema = z.object({
  fullname: z.string().min(2, "Full Name must be at least 2 characters"),
  UserName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobileNumber: z.string().min(10, "Please enter a valid mobile number"),
  dob: z.string().min(1, "Please enter your date of birth"),
  role: z.enum(["user", "admin", "setter"], {
    required_error: "Please select a role",
  }),
});

const SignupPage = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { register, user: authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
       navigate('/', {replace: true });
    }
  }, [authUser, navigate]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      UserName: "",
      email: "",
      password: "",
      mobileNumber: "",
      dob: "",
      role: "user",
    },
  });

  const onSubmit = async (values) => {
    setIsSigningUp(true);
    try {
      await register(values);
    } catch (error) {
      console.error("Signup error:", error);
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-purple-300 to-pink-300 animate-gradient bg-[200%_auto]">
              Create an Account
            </h1>
            <p className="text-white/80 text-sm mt-2">Join the Online Judge community</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {[
                { name: "fullname", label: "Full Name", placeholder: "Enter Name Here" },
                { name: "UserName", label: "Username", placeholder: "coolcoder" },
                { name: "mobileNumber", label: "Mobile Number",placeholder: "Enter Mobile Number Here"},
                { name: "email", label: "Email",placeholder: "Enter Email Here"},
                { name: "password", label: "Password", placeholder: "••••••••", type: "password" },
              ].map(({ name, label, placeholder, type = "text" }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">{label}</FormLabel>
                      <FormControl>
                        <Input
                          type={type}
                          placeholder={placeholder}
                          {...field}
                          disabled={isSigningUp}
                          className="bg-[#1f1f2e] border border-white/20 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#00ffa3] rounded-lg transition"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isSigningUp}
                        className="bg-[#1f1f2e] border border-white/20 text-white focus:ring-2 focus:ring-[#00ffa3] rounded-lg transition"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-white font-medium">Select Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col gap-2"
                        disabled={isSigningUp}
                      >
                        {["user", "admin", "setter"].map((role) => (
                          <FormItem key={role} className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value={role} />
                            </FormControl>
                            <FormLabel className="text-white font-normal cursor-pointer">
                              {role === "user"
                                ? "Coder / Participant"
                                : role === "admin"
                                ? "Administrator"
                                : "Problem Setter"}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-all duration-300"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#00ffa3] hover:underline font-semibold"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
