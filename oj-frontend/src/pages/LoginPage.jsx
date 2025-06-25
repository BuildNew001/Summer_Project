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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Please enter your email or username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const { login, user: authUser } = useAuth();
  const [isLogginIn, setIsLogginIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate("/profile");
    }
  }, [authUser, navigate]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLogginIn(true);
    try {
      await login(values);
    } catch (error) {
      console.error("Login page error:", error);
      setIsLogginIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 shadow-xl rounded-3xl p-10 backdrop-blur-md hover:border-[#00ffa3]/20 transition-all duration-300">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-purple-300 to-pink-300 animate-gradient bg-[length:200%_auto] bg-left hover:bg-right transition-[background-position] duration-1000">
              Welcome Back
            </h1>
            <p className="text-white/80 mt-2 text-sm">Login to continue solving challenges</p>
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
                        className="bg-[#1f1f2e] text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-[#00ffa3] transition"
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
                        className="bg-[#1f1f2e] text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-[#00ffa3] transition"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLogginIn}
                className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold py-2 px-4 rounded-xl hover:scale-[1.03] transition-transform duration-300"
              >
                {isLogginIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-white/70 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#00ffa3] font-medium hover:underline transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
