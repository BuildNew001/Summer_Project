import React, { useState } from "react";
import {
  Form,
  FormControl,
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Please enter your email or username"),
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
      setIsLogginIn(true);
      await login(values);
    } catch (error) {
      console.error("Login page error:", error);
    } finally {
      setIsLogginIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white/5 shadow-2xl rounded-3xl p-10 border border-white/10 backdrop-blur-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-purple-300 to-pink-300 animate-gradient bg-[200%_auto]">
              Welcome Back
            </h1>
            <p className="text-white/80 mt-2">Login to continue solving challenges</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">Email or Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="youremail@example.com"
                        {...field}
                        disabled={isLogginIn}
                        className="focus:ring-[#00ffa3] bg-[#2a2a3a] text-white border border-white/20 rounded-lg"
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
                    <FormLabel className="text-white/90">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                        disabled={isLogginIn}
                        className="focus:ring-[#00ffa3] bg-[#2a2a3a] text-white border border-white/20 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold py-2 px-4 rounded-xl hover:scale-105 hover:shadow-xl transition-transform duration-300"
                disabled={isLogginIn}
              >
                {isLogginIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#00ffa3] hover:underline font-semibold"
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