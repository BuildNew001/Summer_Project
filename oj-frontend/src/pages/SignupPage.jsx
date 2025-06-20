import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import debug from 'debug';

const debugSignup = debug('app:signup');

const formSchema = z.object({
  fullname: z.string().min(2, "Full Name must be at least 2 characters"),
  UserName: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobileNumber: z.string().min(10, "Please enter a valid mobile number"),
  role: z.enum(["user", "admin"], {
    required_error: "Please select a role",
  }),
});

const SignupPage = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { register } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      UserName: "",
      email: "",
      password: "",
      mobileNumber: "",
      role: "user",
    },
  });

  const onSubmit = async (values) => {
  
    try {
      setIsSigningUp(true); // Show loading spinner
      // The actual backend API call (e.g., using fetch or axios) happens inside the register function in AuthContext.
      // It should send a POST request to your backend's signup endpoint (e.g., /api/auth/signup).
      await register(values);
      // Navigation and success toasts are handled by the register function in AuthContext on success
    } catch (error) {
      // Error toasts are handled by the register function in AuthContext
      debugSignup("Signup page error:", error);    }
    finally{
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
            <p className="text-gray-600">Join us to get Started</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter Your Name" 
                        {...field} 
                        disabled={isSigningUp}
                        className="focus:ring-[#F08080]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="UserName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter Your Name" 
                        {...field} 
                        disabled={isSigningUp}
                        className="focus:ring-[#F08080]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234567890" 
                        type="tel" 
                        {...field} 
                        disabled={isSigningUp}
                        className="focus:ring-[#F08080]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="youremail@example.com" 
                        type="email" 
                        {...field} 
                        disabled={isSigningUp}
                        className="focus:ring-[#F08080]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        {...field} 
                        disabled={isSigningUp}
                        className="focus:ring-[#F08080]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        disabled={isSigningUp}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="user" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Coder / Participant
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="admin" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                             Administrator (Requires Approval)
                          </FormLabel> {/* Consider adding a note that admin requires backend approval */}
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-[#F08080] hover:bg-[#e57373] text-white transition-colors"
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
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-[#F08080] hover:underline font-medium transition-colors"
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
