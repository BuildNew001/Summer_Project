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

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Please enter your email or username"), // Can be an email or username
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const { login } = useAuth();
  const [isLogginIn, setIsLogginIn] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsLogginIn(true); // Show loading spinner
      await login(values); // Call the login function from AuthContext
      // Navigation is handled by the login function in AuthContext on success
    } catch (error) {
      // Error toast is handled by the login function in AuthContext
      console.error("Login page error:", error);
    }
    finally{
      setIsLogginIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">            
            <h1 className="text-2xl font-bold mb-2">Login to Your Account</h1>
            <p className="text-gray-600">Welcome back!</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="youremail@example.com"
                        type="email"
                        {...field}
                        disabled={isLogginIn}
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
                        disabled={isLogginIn}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-[#F08080] hover:bg-[#e57373] text-white"
              >
                Login
              </Button> {/* Spinner logic was missing here, added below */}
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Dont have an account?{" "}
              <Link
                to="/signup"
                className="text-[#F08080] hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
