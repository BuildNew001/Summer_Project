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
      setIsSigningUp(true);
      await register(values);
    } catch (error) {
      debugSignup("Signup page error:", error);
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-12 animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white mb-2">Create an Account</h1>
            <p className="text-slate-300">Join the Online Judge community</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {['fullname', 'UserName', 'mobileNumber', 'email', 'password'].map((name, index) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">
                        {name === 'UserName' ? 'Username' : name === 'mobileNumber' ? 'Mobile Number' : name.charAt(0).toUpperCase() + name.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={name === 'password' ? 'password' : name === 'email' ? 'email' : name === 'mobileNumber' ? 'tel' : 'text'}
                          placeholder={name === 'UserName' ? 'coolcoder123' : name === 'email' ? 'you@example.com' : ''}
                          {...field}
                          disabled={isSigningUp}
                          className="bg-white/20 border border-white/30 text-white placeholder:text-slate-400 focus:ring-[#F08080]"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              ))}

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
                        {['user', 'admin'].map(role => (
                          <FormItem key={role} className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value={role} />
                            </FormControl>
                            <FormLabel className="text-white font-normal cursor-pointer">
                              {role === 'user' ? 'Coder / Participant' : 'Administrator (Approval Needed)'}
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
                className="w-full bg-gradient-to-r from-[#F08080] to-[#e57373] text-white font-bold hover:opacity-90 py-3 rounded-xl shadow-lg"
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
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#F08080] hover:underline font-semibold"
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
